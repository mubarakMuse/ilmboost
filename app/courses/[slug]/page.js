"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import CourseImage from "../components/CourseImage";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCourseBySlug, getCourseImageUrl, isPremiumCourse } from "../courseUtils";
import { hasActiveSession, isEnrolled, getCourseProgress, markSectionComplete, markSectionIncomplete, getCourseProgressPercentage, enrollInCourse, getQuizScore, canAccessCourse, hasActiveLicense } from "@/libs/auth";
import toast from "react-hot-toast";

const CoursePage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;
  const [courseData, setCourseData] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState(null);
  const [completedSections, setCompletedSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [highScore, setHighScore] = useState(null);
  const [hasLicense, setHasLicense] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const courseDataRaw = getCourseBySlug(slug);
    if (!courseDataRaw) {
      router.push('/dashboard');
      return;
    }

    const course = {
      courseID: courseDataRaw.courseID,
      courseTitle: courseDataRaw.courseTitle,
      courseDescription: courseDataRaw.courseDescription,
      courseImage: courseDataRaw.courseImage,
      courseImageAlt: courseDataRaw.courseImageAlt,
      status: courseDataRaw.status || "Available Now",
      whatYouWillLearn: courseDataRaw.whatYouWillLearn || [],
      sections: courseDataRaw.sections || [],
      premium: courseDataRaw.premium || false,
      estimatedTime: courseDataRaw.estimatedTime,
      teacher: courseDataRaw.teacher,
    };

    setCourseData(course);
    
    // Check if course is premium
    const premium = isPremiumCourse(courseDataRaw);
    setIsPremium(premium);
    
    // Check if logged in
    const loggedIn = hasActiveSession();
    setIsLoggedIn(loggedIn);
    
    if (loggedIn) {
      const checkEnrollment = async () => {
        // Check if user has license (for premium courses)
        if (premium) {
          const licenseCheck = await hasActiveLicense();
          setHasLicense(licenseCheck);
          if (!licenseCheck) {
            setIsLoading(false);
            return;
          }
        }
        
        const isEnrolledInCourse = await isEnrolled(course.courseID);
        setEnrolled(isEnrolledInCourse);

        if (isEnrolledInCourse) {
          const courseProgress = await getCourseProgress(course.courseID);
          setProgress(courseProgress);
          setCompletedSections(courseProgress.completedSections || []);
          
          // Get high score for final quiz
          const quizScore = await getQuizScore(course.courseID, 'final');
          setHighScore(quizScore);
        }
        setIsLoading(false);
      };
      checkEnrollment();
    } else {
      setIsLoading(false);
    }
  }, [slug, router]);

  // Calculate progress percentage
  useEffect(() => {
    if (!courseData || !enrolled) {
      setProgressPercentage(0);
      return;
    }

    const totalSections = courseData.sections?.length || 0;
    if (totalSections === 0) {
      setProgressPercentage(0);
      return;
    }

    const calculateProgress = async () => {
      try {
        const percentage = await getCourseProgressPercentage(courseData.courseID, totalSections);
        setProgressPercentage(percentage);
      } catch (error) {
        console.error('Error calculating progress:', error);
        setProgressPercentage(0);
      }
    };
    
    calculateProgress();
  }, [enrolled, courseData?.courseID, courseData?.sections?.length, completedSections.length]);

  const handleToggleSection = async (sectionNumber) => {
    if (!enrolled || !courseData) return;

    const isCompleted = completedSections.includes(sectionNumber);
    
    if (isCompleted) {
      await markSectionIncomplete(courseData.courseID, sectionNumber);
      setCompletedSections(prev => prev.filter(s => s !== sectionNumber));
    } else {
      await markSectionComplete(courseData.courseID, sectionNumber);
      setCompletedSections(prev => [...prev, sectionNumber]);
    }

    const updatedProgress = await getCourseProgress(courseData.courseID);
    setProgress(updatedProgress);
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </main>
        <Footer />
      </>
    );
  }

  if (!courseData) {
    return null;
  }

  const isAvailable = courseData.status === "Available Now";
  const totalSections = courseData.sections?.length || 0;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAFAFA]">
        {/* Back Navigation */}
        <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link 
              href="/dashboard" 
              className="text-gray-600 hover:text-black transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Coming Soon Alert */}
          {!isAvailable && (
            <div className="mb-8 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏳</span>
                <div>
                  <h3 className="font-semibold text-black mb-1">Coming Soon</h3>
                  <p className="text-sm text-gray-600">This course is currently under development and will be available soon.</p>
                </div>
              </div>
            </div>
          )}

          {/* Course Header */}
          <div className="mb-12">
            {courseData.courseImage && (
              <div className="w-full h-64 sm:h-80 rounded-xl overflow-hidden border-2 border-gray-300 bg-gray-200 mb-6">
                <CourseImage
                  src={getCourseImageUrl(courseData.courseImage)}
                  alt={courseData.courseImageAlt || courseData.courseTitle}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                {isPremium ? (
                  <span className="px-3 py-1 text-sm font-semibold bg-[#F5E6D3] text-black rounded-md">
                    Premium
                  </span>
                ) : (
                  <span className="px-3 py-1 text-sm font-semibold bg-gray-200 text-gray-700 rounded-md">
                    Free
                  </span>
                )}
                {courseData.estimatedTime && (
                  <span className="text-sm text-gray-600">⏱ {courseData.estimatedTime}</span>
                )}
                {courseData.teacher && (
                  <span className="text-sm text-gray-600">👤 {courseData.teacher}</span>
                )}
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-black mb-4 leading-tight">
                {courseData.courseTitle}
              </h1>
              
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                {courseData.courseDescription}
              </p>

              {/* Progress Bar - only if enrolled */}
              {enrolled && totalSections > 0 && (
                <div className="bg-white border-2 border-gray-300 rounded-xl p-6 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-black">Course Progress</span>
                    <span className="text-sm font-semibold text-black">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div 
                      className="bg-black h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600">
                    {completedSections.length} of {totalSections} sections completed
                  </p>
                </div>
              )}

              {/* Premium course - License required */}
              {isLoggedIn && isPremium && !hasLicense && !enrolled && (
                <div className="bg-[#F5E6D3] border-2 border-black rounded-xl p-6 mb-6">
                  <h3 className="font-semibold text-black mb-2">Premium Course - License Required</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    This is a premium course that requires an active license. Please purchase a license or activate your license key to enroll.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link 
                      href="/membership" 
                      className="px-6 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors text-center"
                    >
                      Purchase License
                    </Link>
                    <Link 
                      href="/account" 
                      className="px-6 py-2 bg-white text-black font-semibold border-2 border-black rounded-lg hover:bg-gray-50 transition-colors text-center"
                    >
                      Activate License Key
                    </Link>
                  </div>
                </div>
              )}

              {/* Enroll button if not enrolled but logged in */}
              {isLoggedIn && !enrolled && isAvailable && !(isPremium && !hasLicense) && (
                <button
                  onClick={async () => {
                    const result = await enrollInCourse(courseData.courseID);
                    if (!result.success) {
                      if (result.error === 'License required' || result.message) {
                        toast.error(result.message || 'This is a premium course. A license is required to enroll.');
                      } else {
                        toast.error(result.error || 'Failed to enroll. Please try again.');
                      }
                      return;
                    }
                    toast.success('Successfully enrolled in course!');
                    setEnrolled(true);
                    const courseProgress = await getCourseProgress(courseData.courseID);
                    setProgress(courseProgress);
                    setCompletedSections(courseProgress.completedSections || []);
                  }}
                  className="px-8 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Enroll in Course
                </button>
              )}

              {/* Login prompt if not logged in */}
              {!isLoggedIn && (
                <div className="bg-white border-2 border-gray-300 rounded-xl p-6">
                  <h3 className="font-semibold text-black mb-2">Login Required</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Please login to enroll in this course and access full content.
                  </p>
                  <Link 
                    href="/login" 
                    className="inline-block px-6 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Login →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* What You Will Learn */}
          {courseData.whatYouWillLearn && courseData.whatYouWillLearn.length > 0 && (
            <div className="bg-white border-2 border-gray-300 rounded-xl p-6 sm:p-8 mb-12">
              <h2 className="text-2xl font-serif font-bold text-black mb-6">What You Will Learn</h2>
              <ul className="space-y-3">
                {courseData.whatYouWillLearn.map((item, index) => (
                  <li key={index} className="text-base text-gray-700 leading-relaxed flex items-start gap-3">
                    <span className="text-black mt-1 flex-shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Course Sections */}
          {isAvailable && (
            <div className="mb-12">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-black mb-6">Course Sections</h2>
              <div className="space-y-4">
                {courseData.sections.map((section) => {
                  const isCompleted = enrolled && completedSections.includes(section.sectionNumber);
                  const hasQuiz = section.quiz && Array.isArray(section.quiz) && section.quiz.length > 0;
                  
                  return (
                    <Link
                      key={section.sectionNumber}
                      href={enrolled ? `/courses/${slug}/${section.sectionNumber}` : '#'}
                      onClick={(e) => {
                        if (!enrolled) {
                          e.preventDefault();
                          router.push('/dashboard');
                        }
                      }}
                      className={`block bg-white border-2 rounded-xl overflow-hidden transition-all ${
                        enrolled 
                          ? 'border-gray-300 hover:border-black hover:shadow-lg cursor-pointer' 
                          : 'border-gray-200 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                              <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-md">
                                Section {section.sectionNumber}
                              </span>
                              {isCompleted && (
                                <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-md">
                                  ✓ Completed
                                </span>
                              )}
                            </div>
                            <h3 className="text-xl font-semibold text-black mb-2">
                              {section.sectionTitle}
                            </h3>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              {section.vocab && section.vocab.length > 0 && (
                                <span>📚 {section.vocab.length} vocabulary terms</span>
                              )}
                              {hasQuiz && (
                                <span>📝 {section.quiz.length} quiz questions</span>
                              )}
                            </div>
                          </div>
                          {enrolled && (
                            <div className="flex-shrink-0">
                              <svg className="w-6 h-6 text-gray-400 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Final Exam */}
          {isLoggedIn && enrolled && isAvailable && courseData.sections.some(s => s.quiz && Array.isArray(s.quiz) && s.quiz.length > 0) && (
            <div className="bg-gradient-to-r from-[#F5E6D3] to-[#E8D4B8] border-2 border-black rounded-xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-serif font-bold text-black">📋 Final Exam</h3>
                {highScore && (
                  <span className="px-4 py-2 bg-black text-white font-semibold rounded-lg text-sm">
                    High Score: {highScore.score}%
                  </span>
                )}
              </div>
              <p className="text-base text-gray-700 mb-6 leading-relaxed">
                Take the complete course exam with all questions from all sections. This is your final assessment.
                {highScore && (
                  <span className="block mt-3 font-semibold text-black">
                    Your best score: {highScore.correct_answers} / {highScore.total_questions} ({highScore.score}%)
                  </span>
                )}
              </p>
              <Link
                href={`/courses/${slug}/quiz`}
                className="inline-block px-8 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                {highScore ? `Retake Final Exam (Best: ${highScore.score}%)` : 'Start Final Exam →'}
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CoursePage;
