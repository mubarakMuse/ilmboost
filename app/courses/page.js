"use client";

import React from "react";
import Link from "next/link";
import { getAllCoursesMetadata, getCourseImageUrl, isPremiumCourse } from "./courseUtils";
import CourseImage from "./components/CourseImage";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CoursesPage = () => {
  const courses = getAllCoursesMetadata();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          {/* Header Section */}
          <div className="mb-12 sm:mb-16 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-black mb-4 leading-tight">
              All Courses
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover comprehensive Islamic studies courses designed for every learner
            </p>
          </div>

          {/* Courses Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length > 0 ? (
              courses.map((course) => {
                const isAvailable = course.status === "Available Now";
                const isPremium = isPremiumCourse(course);
                
                return (
                  <Link
                    key={course.courseID}
                    href={isAvailable ? `/courses/${course.courseSlug}` : '#'}
                    className={`group bg-white border-2 rounded-xl overflow-hidden transition-all ${
                      isAvailable 
                        ? 'border-gray-300 hover:border-black hover:shadow-lg cursor-pointer' 
                        : 'border-gray-200 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    {/* Course Image */}
                    {course.courseImage && (
                      <div className="w-full h-48 bg-gray-200 overflow-hidden">
                        <CourseImage
                          src={getCourseImageUrl(course.courseImage)}
                          alt={course.courseImageAlt || course.courseTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    
                    {/* Course Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {course.type || 'Islamic Studies'}
                        </span>
                        {isPremium ? (
                          <span className="px-2.5 py-1 text-xs font-semibold bg-[#F5E6D3] text-black rounded-md">
                            Premium
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-xs font-semibold bg-gray-200 text-gray-700 rounded-md">
                            Free
                          </span>
                        )}
                        {!isAvailable && (
                          <span className="text-xs text-gray-400 font-medium">Coming Soon</span>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-semibold text-black mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors">
                        {course.courseTitle}
                      </h3>
                      
                      {course.courseDescription && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                          {course.courseDescription}
                        </p>
                      )}

                      {course.estimatedTime && (
                        <p className="text-xs text-gray-500 mb-4">
                          ⏱ {course.estimatedTime}
                        </p>
                      )}

                      {isAvailable && (
                        <div className="flex items-center text-black font-medium text-sm group-hover:gap-2 transition-all">
                          <span>View Course</span>
                          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No courses available at the moment</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CoursesPage;
