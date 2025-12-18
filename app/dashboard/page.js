"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { hasActiveSession, getUser, isEnrolled, enrollInCourse, unenrollFromCourse, getCourseProgress, getCourseProgressPercentage, hasActiveLicense } from "@/libs/auth";
import { getAllCoursesMetadata, getCourseImageUrl, isPremiumCourse } from "../courses/courseUtils";
import CourseImage from "../courses/components/CourseImage";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollments, setEnrollments] = useState({});
  const [courseProgress, setCourseProgress] = useState({});
  const [showPhoneBanner, setShowPhoneBanner] = useState(false);
  const [phoneValue, setPhoneValue] = useState('');
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
  const [hasLicense, setHasLicense] = useState(false);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);
  const hasCheckedSession = useRef(false);
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Only check session once
    if (hasCheckedSession.current) return;
    hasCheckedSession.current = true;
    
    const checkSession = async () => {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }
      
      // Wait a bit for localStorage to be ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const sessionActive = hasActiveSession();
      const userData = getUser();
      
      if (!sessionActive || !userData) {
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          setIsLoading(false);
          router.replace('/login');
        }
        return;
      }

      setUser(userData);
      // Check if phone is missing
      if (!userData?.phone) {
        setShowPhoneBanner(true);
      }
      
      // Check if user has a license
      const licenseCheck = await hasActiveLicense();
      setHasLicense(licenseCheck);
      
      // Show upgrade banner if user has free account and no license
      if ((userData?.membership === 'free' || !userData?.membership) && !licenseCheck) {
        setShowUpgradeBanner(true);
      }
      
      const allCourses = getAllCoursesMetadata();
      setCourses(allCourses);
      
      // Check enrollment status and progress for each course (async)
      const enrollmentStatus = {};
      const progressData = {};
      
      for (const course of allCourses) {
        const enrolled = await isEnrolled(course.courseID);
        enrollmentStatus[course.courseID] = enrolled;
        
        if (enrolled) {
          const progress = await getCourseProgress(course.courseID);
          const totalSections = course.sectionCount || 0;
          const progressPercentage = totalSections > 0 
            ? await getCourseProgressPercentage(course.courseID, totalSections)
            : 0;
          
          progressData[course.courseID] = {
            progress,
            progressPercentage
          };
        }
      }
      
      setEnrollments(enrollmentStatus);
      setCourseProgress(progressData);
      setIsLoading(false);
    };

    checkSession();
  }, [router]);

  const handleEnroll = async (courseId) => {
    const result = await enrollInCourse(courseId);
    if (result.success) {
      setEnrollments(prev => ({ ...prev, [courseId]: true }));
    }
  };

  const handleUnenroll = async (courseId) => {
    if (confirm('Are you sure you want to unenroll? Your progress will be lost.')) {
      const result = await unenrollFromCourse(courseId);
      if (result.success) {
        setEnrollments(prev => ({ ...prev, [courseId]: false }));
      }
    }
  };

  const handleUpdatePhone = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsUpdatingPhone(true);
    try {
      const response = await fetch('/api/auth/update-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          phone: phoneValue
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        setShowPhoneBanner(false);
        setPhoneValue('');
      } else {
        alert(data.error || 'Failed to update phone number');
      }
    } catch (error) {
      console.error('Update phone error:', error);
      alert('Failed to update phone number. Please try again.');
    } finally {
      setIsUpdatingPhone(false);
    }
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

  return (
    <>
      <Header />
      <main className="min-h-screen bg-base-100 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome, {user?.firstName}!
                </h1>
                <p className="text-base-content/70">
                  Your Learning Dashboard
                </p>
              </div>
              <Link href="/account" className="btn btn-outline">
                Account Settings
              </Link>
            </div>

            {showUpgradeBanner && (
              <div className="mb-6 bg-gradient-to-r from-[#F5E6D3] to-[#E8D4B8] border-2 border-black rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-serif font-bold text-black mb-2">Unlock Full Access</h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Upgrade to a paid account to access all premium courses and unlock your full learning potential.
                    </p>
                    <div className="flex gap-3">
                      <Link
                        href="/membership"
                        className="px-6 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        View Plans
                      </Link>
                      <button
                        type="button"
                        onClick={() => setShowUpgradeBanner(false)}
                        className="px-4 py-2 text-gray-600 hover:text-black transition-colors"
                      >
                        Maybe Later
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUpgradeBanner(false)}
                    className="text-gray-500 hover:text-black transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {showPhoneBanner && (
              <div className="mb-6 bg-[#F5E6D3] border-2 border-black rounded-xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-black mb-2">Complete Your Profile</h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Add your phone number to complete your profile (optional but recommended).
                    </p>
                    <form onSubmit={handleUpdatePhone} className="flex gap-3">
                      <input
                        type="tel"
                        value={phoneValue}
                        onChange={(e) => setPhoneValue(e.target.value)}
                        placeholder="+1234567890"
                        className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={isUpdatingPhone}
                        className="px-6 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        {isUpdatingPhone ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPhoneBanner(false)}
                        className="px-4 py-2 text-gray-600 hover:text-black transition-colors"
                      >
                        Skip
                      </button>
                    </form>
                  </div>
                  <button
                    onClick={() => setShowPhoneBanner(false)}
                    className="text-gray-500 hover:text-black transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">Available Courses</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const enrolled = enrollments[course.courseID] || false;
                const isAvailable = course.status === "Available Now";
                const totalSections = course.sectionCount || 0;
                const progressInfo = courseProgress[course.courseID] || null;
                const progress = progressInfo?.progress || null;
                const progressPercentage = progressInfo?.progressPercentage || 0;

                return (
                  <div
                    key={course.courseID}
                    className="card card-border bg-base-100 hover:shadow-lg"
                  >
                    <div className="card-body">
                      {course.courseImage && (
                        <div className="w-full h-48 rounded-lg overflow-hidden border border-base-300 bg-base-200 mb-4">
                          <CourseImage
                            src={getCourseImageUrl(course.courseImage)}
                            alt={course.courseImageAlt || course.courseTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="card-title text-lg flex-1">{course.courseTitle}</h3>
                        {isPremiumCourse(course) ? (
                          <span className="badge badge-sm bg-[#F5E6D3] text-black border-0">Premium</span>
                        ) : (
                          <span className="badge badge-sm bg-gray-200 text-gray-700 border-0">Free</span>
                        )}
                      </div>
                      <p className="text-sm text-base-content/70 line-clamp-2 mb-4">
                        {course.courseDescription}
                      </p>
                      
                      {enrolled && (
                        <div className="mb-4">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{progressPercentage}%</span>
                          </div>
                          <progress 
                            className="progress progress-primary w-full" 
                            value={progressPercentage} 
                            max="100"
                          ></progress>
                          <p className="text-xs text-base-content/60 mt-1">
                            {progress?.completedSections?.length || 0} of {totalSections} sections completed
                          </p>
                        </div>
                      )}

                    

                      <div className="flex gap-2">
                        {enrolled ? (
                          <>
                            <Link
                              href={`/courses/${course.courseSlug}`}
                              className="btn btn-primary btn-sm flex-1"
                            >
                              Continue Learning
                            </Link>
                            <button
                              onClick={() => handleUnenroll(course.courseID)}
                              className="btn btn-outline btn-sm"
                              title="Unenroll"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleEnroll(course.courseID)}
                            className="btn btn-primary btn-sm w-full"
                            disabled={!isAvailable}
                          >
                            {isAvailable ? 'Enroll' : 'Coming Soon'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
