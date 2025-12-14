"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import config from "@/config";
import { getAllCourses, getCourseImageUrl } from "./courses/courseUtils";
import CourseImage from "./courses/components/CourseImage";
import { hasActiveSession } from "@/libs/auth";

export default function Page() {
  const router = useRouter();
  const courses = getAllCourses();

  useEffect(() => {
    // Redirect to dashboard if logged in
    if (typeof window !== 'undefined' && hasActiveSession()) {
      router.replace('/dashboard');
    }
  }, [router]);

  return (
    <>
      <Header />
      
      {/* Main Content */}
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center gap-8 px-8 py-24 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            The complete Online Learning Experience For every Muslim
          </h1>
          
          <p className="text-xl md:text-2xl text-base-content/70 leading-relaxed max-w-2xl">
            {config.appDescription}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link href="/signup" className="btn btn-primary btn-lg">
              Get Started
            </Link>
            <Link href="/login" className="btn btn-outline btn-lg">
              Login
            </Link>
          </div>
        </section>

        {/* Course Catalog Section */}
        <section id="courses" className="py-24 px-8 bg-base-200">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4">Our Courses</h2>
            <p className="text-center text-base-content/70 mb-16 max-w-2xl mx-auto">
              Explore our comprehensive collection of Islamic studies courses designed for learners at every level.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const isAvailable = course.status === "Available Now";
                const CourseCard = (
                  <div key={course.courseID} className={`card card-border bg-base-100 transition-all ${
                    isAvailable 
                      ? 'hover:shadow-lg' 
                      : 'opacity-75'
                  }`}>
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
                        <h3 className={`text-lg font-semibold ${
                          isAvailable ? 'text-base-content' : 'text-base-content/60'
                        }`}>
                          {course.courseTitle}
                        </h3>
                        {!isAvailable && (
                          <span className="badge badge-warning">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed text-base-content/70 mb-4 line-clamp-3">
                        {course.courseDescription}
                      </p>
                      {isAvailable ? (
                        <Link 
                          href={`/courses/${course.courseSlug}`}
                          className="btn btn-primary btn-sm w-full"
                        >
                          View Course
                        </Link>
                      ) : (
                        <button className="btn btn-disabled btn-sm w-full" disabled>
                          Coming Soon
                        </button>
                      )}
                    </div>
                  </div>
                );

                return CourseCard;
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
