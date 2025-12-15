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
      premium: courseDataRaw.premium || false, // Ensure premium field is included
    };

    setCourseData(course);
    
    // Check if course is premium - use the raw course data to check
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
        <main className="min-h-screen bg-base-100 flex items-center justify-center">
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
      <main className="min-h-screen bg-base-100 pb-20">
        {/* Mobile-Optimized Header */}
        <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <Link href="/dashboard" className="btn btn-ghost btn-sm">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 py-6">
          
          {!isAvailable && (
            <div className="alert alert-warning mb-6">
              <span>⏳</span>
                <div>
                <h3 className="font-bold">Coming Soon</h3>
                <div className="text-xs">This course is currently under development and will be available soon.</div>
              </div>
            </div>
          )}

          {/* Course Header - Mobile Optimized */}
          <div className="mb-8">
            {courseData.courseImage && (
              <div className="w-full h-48 md:h-64 rounded-lg overflow-hidden border border-base-300 bg-base-200 mb-4">
                <CourseImage
                  src={getCourseImageUrl(courseData.courseImage)}
                  alt={courseData.courseImageAlt || courseData.courseTitle}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-base-content">
                  {courseData.courseTitle}
                </h1>
                {isPremium ? (
                  <span className="badge bg-[#F5E6D3] text-black border-0">Premium</span>
                ) : (
                  <span className="badge bg-gray-200 text-gray-700 border-0">Free</span>
                )}
              </div>
              <p className="text-sm md:text-base text-base-content/70 leading-relaxed">
                {courseData.courseDescription}
              </p>
            </div>

            {/* Progress Bar - only if enrolled */}
            {enrolled && totalSections > 0 && (
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Course Progress</span>
                  <span>{progressPercentage}%</span>
                </div>
                <progress 
                  className="progress progress-primary w-full" 
                  value={progressPercentage} 
                  max="100"
                ></progress>
                <p className="text-xs text-base-content/60 mt-1">
                  {completedSections.length} of {totalSections} sections completed
                </p>
              </div>
            )}

            {/* Premium course - License required (shown before enroll button) */}
            {isLoggedIn && isPremium && !hasLicense && !enrolled && (
              <div className="mt-6 alert alert-warning">
                <div>
                  <h3 className="font-bold text-sm">Premium Course - License Required</h3>
                  <div className="text-xs mt-2">
                    This is a premium course that requires an active license. Please purchase a license or activate your license key to enroll.
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Link href="/membership" className="btn btn-sm btn-primary">
                      Purchase License
                    </Link>
                    <Link href="/account" className="btn btn-sm btn-outline">
                      Activate License Key
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Enroll button if not enrolled but logged in */}
            {isLoggedIn && !enrolled && isAvailable && !(isPremium && !hasLicense) && (
              <div className="mt-6">
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
                  className="btn btn-primary w-full md:w-auto"
                >
                  Enroll in Course
                </button>
              </div>
            )}

            {/* Login prompt if not logged in */}
            {!isLoggedIn && (
              <div className="mt-6 alert alert-info">
                <div>
                  <h3 className="font-bold text-sm">Login Required</h3>
                  <div className="text-xs">
                    Please login to enroll in this course and access full content.
                    <Link href="/login" className="link link-primary ml-2">
                      Login →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* What You Will Learn - Mobile Optimized */}
          {courseData.whatYouWillLearn.length > 0 && (
            <div className="card bg-base-200 mb-8">
              <div className="card-body p-4">
                <h2 className="card-title text-base md:text-lg mb-3">What You Will Learn</h2>
                <ul className="space-y-2">
                  {courseData.whatYouWillLearn.map((item, index) => (
                    <li key={index} className="text-xs md:text-sm leading-relaxed text-base-content/80 flex items-start">
                      <span className="text-primary mr-2 mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Course Sections - Mobile-Optimized */}
          {isAvailable && (
            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold mb-4">Course Sections</h2>
              <div className="space-y-3">
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
                      className="card bg-base-100 border border-base-300 hover:shadow-lg transition-shadow block"
                    >
                      <div className="card-body p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="badge badge-outline badge-sm">
                                Section {section.sectionNumber}
                              </span>
                              {isCompleted && (
                                <span className="badge badge-success badge-sm">✓ Completed</span>
                              )}
                            </div>
                            <h3 className="text-base font-semibold text-base-content mb-2 line-clamp-2">
                              {section.sectionTitle}
                            </h3>
                            <div className="flex flex-wrap gap-3 text-xs text-base-content/60">
                              {section.vocab && section.vocab.length > 0 && (
                                <span>📚 {section.vocab.length} vocab</span>
                              )}
                              {hasQuiz && (
                                <span>📝 {section.quiz.length} quiz</span>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="text-2xl text-base-content/40">→</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Final Exam - only if logged in and enrolled */}
          {isLoggedIn && enrolled && isAvailable && courseData.sections.some(s => s.quiz && Array.isArray(s.quiz) && s.quiz.length > 0) && (
            <div className="card bg-primary text-primary-content mt-8">
              <div className="card-body">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="card-title text-lg mb-0">📋 Final Exam</h3>
                  {highScore && (
                    <div className="badge badge-secondary badge-lg">
                      High Score: {highScore.score}%
                    </div>
                  )}
                </div>
                <p className="text-sm opacity-90 mb-4">
                  Take the complete course exam with all questions from all sections. This is your final assessment.
                  {highScore && (
                    <span className="block mt-2 font-semibold">
                      Your best score: {highScore.correct_answers} / {highScore.total_questions} ({highScore.score}%)
                    </span>
                  )}
                </p>
                <Link
                  href={`/courses/${slug}/quiz`}
                  className="btn btn-secondary w-full"
                >
                  {highScore ? `Retake Final Exam (Best: ${highScore.score}%)` : 'Start Final Exam →'}
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CoursePage;
