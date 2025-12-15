"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import config from "@/config";
import { getAllCourses, getCourseImageUrl, isPremiumCourse } from "./courses/courseUtils";
import CourseImage from "./courses/components/CourseImage";
import { hasActiveSession } from "@/libs/auth";
import logo from "@/app/icon.png";

export default function LandingPage() {
  const router = useRouter();
  const courses = getAllCourses();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Redirect to dashboard if logged in
    if (typeof window !== 'undefined' && hasActiveSession()) {
      router.replace('/dashboard');
    }
  }, [router]);

  // Filter courses based on search query
  const filteredCourses = courses.filter((course) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      course.courseTitle.toLowerCase().includes(query) ||
      course.courseDescription.toLowerCase().includes(query) ||
      course.type?.toLowerCase().includes(query)
    );
  });

  return (
    <>
      {/* Structured Data for SEO */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            name: "Ilm Boost",
            description: "Make authentic Islamic knowledge more accessible. Ilm Boost offers comprehensive online Islamic studies courses for every Muslim learner.",
            url: `https://${config.domainName}`,
            logo: `https://${config.domainName}/icon.png`,
            sameAs: [],
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              description: "Free Islamic courses available"
            },
            course: getAllCourses().slice(0, 10).map(course => ({
              "@type": "Course",
              name: course.courseTitle,
              description: course.courseDescription,
              provider: {
                "@type": "Organization",
                name: "Ilm Boost"
              },
              courseCode: course.courseID,
              educationalLevel: "Beginner to Advanced"
            }))
          }),
        }}
      />
      
      {/* Minimal Header - Oboe style */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Image
              src={logo}
              alt={`${config.appName} logo`}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full"
              width={32}
              height={32}
            />
            <span className="font-serif font-normal text-lg sm:text-xl text-black tracking-tight">{config.appName}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/signup" className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#F5E6D3] hover:bg-[#E8D4B8] text-black font-medium rounded-md transition-colors text-sm sm:text-base">
              Sign Up
            </Link>
            <Link href="/login" className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white hover:bg-gray-50 text-black font-medium border border-black rounded-md transition-colors text-sm sm:text-base">
              Log In
            </Link>
          </div>
        </div>
      </header>

      <main className="min-h-screen bg-[#FAFAFA]">
        {/* Main Content Area - Mobile Optimized */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          {/* Hero Section - Enhanced */}
          <div className="mb-12 sm:mb-16 lg:mb-20">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-black mb-4 sm:mb-6 lg:mb-8 leading-[1.1] tracking-tight">
              What do you want to learn about?
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-10 max-w-2xl">
              Discover comprehensive Islamic studies courses designed for every learner.
            </p>

            {/* Search Input - Enhanced */}
            <div className="relative mb-10 sm:mb-12 lg:mb-16">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Teach me about..."
                className="w-full px-5 sm:px-6 py-4 sm:py-5 text-base sm:text-lg border-2 border-black rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-black shadow-sm transition-shadow"
              />
              <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button 
                  onClick={() => setSearchQuery("")}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors shadow-sm"
                  title="Clear search"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Course List - Enhanced */}
            <div className="space-y-3 sm:space-y-4">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => {
                  const isAvailable = course.status === "Available Now";
                  
                  return (
                    <Link
                      key={course.courseID}
                      href={isAvailable ? `/courses/${course.courseSlug}` : '#'}
                      className={`group flex items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-xl transition-all border-2 ${
                        isAvailable 
                          ? 'border-transparent hover:border-gray-300 hover:bg-white hover:shadow-md cursor-pointer' 
                          : 'border-gray-200 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      {/* Course Thumbnail */}
                      {course.courseImage && (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                          <CourseImage
                            src={getCourseImageUrl(course.courseImage)}
                            alt={course.courseImageAlt || course.courseTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      
                      {/* Course Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {course.type || 'Islamic Studies'}
                          </span>
                          {isPremiumCourse(course) ? (
                            <span className="px-2 py-0.5 text-xs font-semibold bg-[#F5E6D3] text-black rounded-md">
                              Premium
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs font-semibold bg-gray-200 text-gray-700 rounded-md">
                              Free
                            </span>
                          )}
                          {!isAvailable && (
                            <span className="text-xs text-gray-400 font-medium">• Coming Soon</span>
                          )}
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-black line-clamp-2 group-hover:text-gray-700 transition-colors">
                          {course.courseTitle}
                        </h3>
                        {course.courseDescription && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1 hidden sm:block">
                            {course.courseDescription}
                          </p>
                        )}
                      </div>
                      
                      {/* Arrow Icon */}
                      {isAvailable && (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black flex-shrink-0 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </Link>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No courses found matching &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

