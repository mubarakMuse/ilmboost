"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCourseBySlug } from "../../courseUtils";
import { hasActiveSession, isEnrolled, markSectionComplete, saveQuizScore, getUser, hasActiveLicense } from "@/libs/auth";

const CourseQuiz = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params?.slug;
  const sectionFilter = searchParams.get('section');
  
  const [courseData, setCourseData] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasLicense, setHasLicense] = useState(false);
  const [isCheckingLicense, setIsCheckingLicense] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const loggedIn = hasActiveSession();
      setIsLoggedIn(loggedIn);
      
      if (!loggedIn) {
        setIsLoading(false);
        setIsCheckingLicense(false);
        return;
      }
      
      // Check if user has a license (quizzes require license)
      const user = getUser();
      if (user?.id) {
        try {
          const response = await fetch(`/api/licenses/check?userId=${user.id}`);
          const data = await response.json();
          setHasLicense(data.success && data.hasLicense === true);
        } catch (error) {
          console.error('Error checking license:', error);
          setHasLicense(false);
        }
      } else {
        setHasLicense(false);
      }
      setIsCheckingLicense(false);
    };
    
    checkAccess();
  }, []);
  
  useEffect(() => {
    // Wait for license check to complete
    if (isCheckingLicense) return;
    
    // If not logged in or no license, stop loading and show appropriate message
    if (!isLoggedIn || !hasLicense) {
      setIsLoading(false);
      return;
    }

    // Load course data and questions
    if (slug) {
      const course = getCourseBySlug(slug);
      if (course) {
        setCourseData(course);
        
        const isAvailable = course.status === "Available Now";
        
        if (isAvailable) {
          const questions = [];
          
          if (sectionFilter) {
            // Section-specific quiz
            const sectionNum = parseInt(sectionFilter);
            const section = course.sections?.find(s => s.sectionNumber === sectionNum);
            if (section?.quiz && Array.isArray(section.quiz)) {
              section.quiz.forEach((quiz, index) => {
                questions.push({
                  id: `section-${sectionNum}-q-${index}`,
                  sectionNumber: sectionNum,
                  sectionTitle: section.sectionTitle,
                  question: quiz.question,
                  options: quiz.options,
                  correctAnswer: quiz.correctAnswer,
                });
              });
            }
          } else {
            // Complete course quiz
            course.sections?.forEach((section) => {
              if (section.quiz && Array.isArray(section.quiz)) {
                section.quiz.forEach((quiz, index) => {
                  questions.push({
                    id: `section-${section.sectionNumber}-q-${index}`,
                    sectionNumber: section.sectionNumber,
                    sectionTitle: section.sectionTitle,
                    question: quiz.question,
                    options: quiz.options,
                    correctAnswer: quiz.correctAnswer,
                  });
                });
              }
            });
          }
          
          setAllQuestions(questions);
        }
      }
    }
    setIsLoading(false);
  }, [slug, sectionFilter, isCheckingLicense, isLoggedIn, hasLicense]);

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    setShowResults(true);
    setCurrentQuestionIndex(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Calculate score
    const { correct, total } = calculateScore();
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    // Save quiz score if this is a final quiz (not a section quiz)
    if (!sectionFilter && courseData) {
      const user = getUser();
      if (user) {
        try {
          const result = await saveQuizScore(
            courseData.courseID,
            percentage,
            correct,
            total,
            'final'
          );
          
          if (result.success) {
            setScoreSaved(true);
            if (result.isNewHighScore) {
              setIsNewHighScore(true);
            }
          }
        } catch (error) {
          console.error('Error saving quiz score:', error);
        }
      }
    }
    
    // Automatically mark section as complete if this is a section quiz
    if (sectionFilter && courseData) {
      const sectionNum = parseInt(sectionFilter);
      const checkAndMark = async () => {
        const isEnrolledInCourse = await isEnrolled(courseData.courseID);
        
        if (isEnrolledInCourse) {
          // Mark section as complete when quiz is submitted
          await markSectionComplete(courseData.courseID, sectionNum);
        }
      };
      checkAndMark();
    }
  };

  const handleReset = () => {
    setAnswers({});
    setShowResults(false);
    setCurrentQuestionIndex(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const calculateScore = () => {
    let correct = 0;
    allQuestions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return { correct, total: allQuestions.length };
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-base-100 flex items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </main>
        <Footer />
      </>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-base-100">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body text-center">
                <h1 className="text-2xl font-bold mb-4">Login Required</h1>
                <p className="text-base-content/70 mb-6">Please login to take the quiz.</p>
                <div className="flex gap-4 justify-center">
                  <Link href="/login" className="btn btn-primary">
                    Login
                  </Link>
                  <Link href={`/courses/${slug}`} className="btn btn-outline">
                    ← Back to Course
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!hasLicense) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-base-100">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body text-center">
                <h1 className="text-2xl font-bold mb-4">License Required</h1>
                <p className="text-base-content/70 mb-6">
                  Quizzes are only available to licensed users. Please purchase a license or activate your license key to access quizzes.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Link href="/membership" className="btn btn-primary">
                    Purchase License
                  </Link>
                  <Link href="/account" className="btn btn-outline">
                    Activate License Key
                  </Link>
                  <Link href={`/courses/${slug}`} className="btn btn-outline">
                    ← Back to Course
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!courseData) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-base-100">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
              <Link href="/courses" className="link link-hover text-sm">
                ← Back to Courses
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const isAvailable = courseData.status === "Available Now";

  if (!isAvailable) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-base-100">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="alert alert-warning mb-6">
              <span>⏳</span>
              <div>
                <h3 className="font-bold">Coming Soon</h3>
                <div className="text-xs">This course quiz will be available when the course is released.</div>
              </div>
            </div>
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Quiz Coming Soon</h1>
              <p className="text-base-content/70 mb-6">This quiz will be available when the course is released.</p>
              <Link href={`/courses/${slug}`} className="link link-hover text-sm">
                ← Back to Course
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (allQuestions.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-base-100">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">No Quiz Available</h1>
              <p className="text-base-content/70 mb-6">This course doesn&apos;t have any quiz questions yet.</p>
              <Link href={`/courses/${slug}`} className="link link-hover text-sm">
                ← Back to Course
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const { correct, total } = calculateScore();
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const currentQuestion = allQuestions[currentQuestionIndex];
  const userAnswer = answers[currentQuestion?.id];
  const isCorrect = userAnswer === currentQuestion?.correctAnswer;
  const answeredCount = Object.keys(answers).length;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-base-100 pb-20">
        {/* Mobile-Optimized Header */}
        <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <Link href={`/courses/${slug}${sectionFilter ? `/${sectionFilter}` : ''}`} className="btn btn-ghost btn-sm">
                ← Back
              </Link>
              {!showResults && (
                <span className="text-xs text-base-content/60">
                  {currentQuestionIndex + 1} / {total}
                </span>
              )}
            </div>
            <h1 className="text-lg font-bold text-base-content">
              {sectionFilter ? `Section ${sectionFilter} Quiz` : 'Course Quiz'}
            </h1>
            {!showResults && (
              <div className="mt-2">
                <progress 
                  className="progress progress-primary w-full h-1.5" 
                  value={((currentQuestionIndex + 1) / total) * 100} 
                  max="100"
                ></progress>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Results Summary */}
          {showResults && (
            <div className="card bg-base-200 mb-6">
              <div className="card-body text-center">
                <div className="text-5xl font-bold mb-2 text-base-content">
                  {correct} / {total}
                </div>
                <div 
                  className="text-3xl font-semibold mb-4" 
                  style={{ 
                    color: percentage >= 70 ? '#059669' : percentage >= 50 ? '#d97706' : '#dc2626' 
                  }}
                >
                  {percentage}%
                </div>
                <p className="text-base text-base-content/70 mb-4">
                  {percentage >= 70 
                    ? "Excellent work! 🎉" 
                    : percentage >= 50 
                    ? "Good effort! Keep studying." 
                    : "Keep practicing! You'll improve."}
                </p>
                {!sectionFilter && scoreSaved && isNewHighScore && (
                  <div className="alert alert-success mb-4">
                    <div>
                      <span className="text-lg">🏆</span>
                      <div>
                        <h3 className="font-bold">New High Score!</h3>
                        <p className="text-sm">Your score of {percentage}% has been saved as your best attempt.</p>
                      </div>
                    </div>
                  </div>
                )}
                {!sectionFilter && scoreSaved && !isNewHighScore && (
                  <div className="alert alert-info mb-4">
                    <div>
                      <span className="text-lg">📊</span>
                      <div>
                        <h3 className="font-bold">Score Saved</h3>
                        <p className="text-sm">Your score has been recorded. Keep practicing to beat your high score!</p>
                      </div>
                    </div>
                  </div>
                )}
                {sectionFilter && (
                  <div className="alert alert-success mb-4">
                    <div>
                      <span className="text-lg">✓</span>
                      <div>
                        <h3 className="font-bold">Section Marked as Complete!</h3>
                        <p className="text-sm">You can now proceed to the next section.</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-3">
                  {sectionFilter ? (
                    <>
                      <Link
                        href={`/courses/${slug}/${parseInt(sectionFilter) + 1}`}
                        className="btn btn-primary w-full"
                      >
                        Continue to Next Section →
                      </Link>
                      <Link
                        href={`/courses/${slug}/${sectionFilter}`}
                        className="btn btn-outline w-full"
                      >
                        Back to Section
                      </Link>
                      <button
                        onClick={handleReset}
                        className="btn btn-ghost btn-sm w-full"
                      >
                        Retake Quiz
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleReset}
                        className="btn btn-primary w-full"
                      >
                        Retake Quiz
                      </button>
                      <Link
                        href={`/courses/${slug}`}
                        className="btn btn-outline w-full"
                      >
                        Back to Course
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mobile-Optimized Question View (One at a time) */}
          {!showResults && currentQuestion && (
            <div className="space-y-6">
              <div className="card bg-base-100 border border-base-300">
                <div className="card-body">
                  <div className="mb-4">
                    <p className="text-sm text-base-content/60 mb-1">
                      {sectionFilter 
                        ? `Section ${currentQuestion.sectionNumber}` 
                        : `Section ${currentQuestion.sectionNumber}: ${currentQuestion.sectionTitle}`}
                    </p>
                    <h2 className="text-xl font-bold text-base-content">
                      {currentQuestion.question}
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {currentQuestion.options.map((option, optIndex) => {
                      const isSelected = userAnswer === option;
                      
                      return (
                        <button
                          key={optIndex}
                          onClick={() => handleAnswer(currentQuestion.id, option)}
                          className={`w-full text-left px-4 py-4 text-base border-2 rounded-lg transition-all font-medium ${
                            isSelected
                              ? 'bg-primary text-primary-content border-primary shadow-md'
                              : 'border-base-300 text-base-content hover:bg-base-200 hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              isSelected 
                                ? 'bg-primary-content text-primary' 
                                : 'bg-base-200 text-base-content'
                            }`}>
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span className="flex-1">{option}</span>
                            {isSelected && (
                              <span className="text-2xl">✓</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0}
                  className="btn btn-outline flex-1 disabled:btn-disabled"
                >
                  ← Previous
                </button>
                {currentQuestionIndex < allQuestions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    disabled={!userAnswer}
                    className="btn btn-primary flex-1 disabled:btn-disabled"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!userAnswer || answeredCount < total}
                    className="btn btn-success flex-1 disabled:btn-disabled"
                  >
                    Submit Quiz
                  </button>
                )}
              </div>

              {/* Progress Info */}
              <div className="text-center text-sm text-base-content/60">
                {answeredCount} of {total} questions answered
              </div>
            </div>
          )}

          {/* Review Mode - Show All Questions with Results */}
          {showResults && (
            <div className="space-y-4">
              {allQuestions.map((question, index) => {
                const userAnswer = answers[question.id];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <div
                    key={question.id}
                    className="card bg-base-100 border-2 border-base-300"
                  >
                    <div className="card-body">
                      <div className="flex items-start gap-3 mb-4">
                        <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isCorrect ? 'bg-success text-success-content' : 'bg-error text-error-content'
                        }`}>
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-base font-medium text-base-content mb-1">
                            {question.question}
                          </p>
                          <p className="text-xs text-base-content/50">
                            Section {question.sectionNumber}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 ml-11">
                        {question.options.map((option, optIndex) => {
                          const isSelected = userAnswer === option;
                          const isCorrectOption = option === question.correctAnswer;
                          
                          let buttonClass = "w-full text-left px-4 py-3 text-sm border-2 rounded-lg font-medium";
                          
                          if (isCorrectOption) {
                            buttonClass += " bg-success/20 border-success text-success";
                          } else if (isSelected && !isCorrect) {
                            buttonClass += " bg-error/20 border-error text-error";
                          } else {
                            buttonClass += " border-base-300 text-base-content/50 bg-base-100";
                          }

                          return (
                            <div
                              key={optIndex}
                              className={buttonClass}
                            >
                              <div className="flex items-center gap-2">
                                {isCorrectOption && (
                                  <span className="text-success font-bold">✓</span>
                                )}
                                {isSelected && !isCorrect && (
                                  <span className="text-error font-bold">✗</span>
                                )}
                                <span>{option}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CourseQuiz;
