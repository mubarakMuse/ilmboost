"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { hasActiveSession, getUser, isEnrolled, enrollInCourse, unenrollFromCourse, getCourseProgress, getCourseProgressPercentage } from "@/libs/auth";
import { getAllCourses, getCourseImageUrl } from "../courses/courseUtils";
import CourseImage from "../courses/components/CourseImage";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollments, setEnrollments] = useState({});
  const [courseProgress, setCourseProgress] = useState({});
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
      const allCourses = getAllCourses();
      setCourses(allCourses);
      
      // Check enrollment status and progress for each course (async)
      const enrollmentStatus = {};
      const progressData = {};
      
      for (const course of allCourses) {
        const enrolled = await isEnrolled(course.courseID);
        enrollmentStatus[course.courseID] = enrolled;
        
        if (enrolled) {
          const progress = await getCourseProgress(course.courseID);
          const totalSections = course.sections?.length || 0;
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
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">Available Courses</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const enrolled = enrollments[course.courseID] || false;
                const isAvailable = course.status === "Available Now";
                const totalSections = course.sections?.length || 0;
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
                      <h3 className="card-title text-lg">{course.courseTitle}</h3>
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

                      {!isAvailable && (
                        <div className="badge badge-warning mb-4">Coming Soon</div>
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
