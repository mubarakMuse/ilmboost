"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import config from "@/config";
import { getAllCoursesMetadata, getCourseImageUrl, isPremiumCourse } from "./courses/courseUtils";
import CourseImage from "./courses/components/CourseImage";
import { hasActiveSession } from "@/libs/auth";
import logo from "@/app/icon.png";

export default function LandingPage() {
  const router = useRouter();
  const courses = getAllCoursesMetadata();
  const [showQuizPopup, setShowQuizPopup] = useState(false);

  useEffect(() => {
    // Redirect to dashboard if logged in
    if (typeof window !== 'undefined' && hasActiveSession()) {
      router.replace('/dashboard');
    }
  }, [router]);

  useEffect(() => {
    // Show quiz popup after user spends 10 seconds on the page
    const timer = setTimeout(() => {
      // Check if user hasn't dismissed it before (using localStorage)
      const dismissed = localStorage.getItem('quizPopupDismissed');
      if (!dismissed) {
        setShowQuizPopup(true);
      }
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, []);

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
            description: "Making authentic Islamic knowledge more accessible. Ilm Boost offers comprehensive online Islamic studies courses for every Muslim learner.",
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
            course: getAllCoursesMetadata().slice(0, 10).map(course => ({
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
      
      <Header />

      <main className="min-h-screen bg-[#FAFAFA]">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-black mb-6 leading-tight tracking-tight">
              Learn Islamic Studies
              <br />
              <span className="text-gray-600">at Your Own Pace</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              Discover comprehensive courses covering Tafseer, Hadith Sciences, and more. 
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/signup"
                className="px-8 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
              >
                Get Started Free
              </Link>
              <Link
                href="/courses"
                className="px-8 py-3 bg-white text-black font-semibold border-2 border-black rounded-lg hover:bg-gray-50 transition-colors"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </section>

        {/* Courses Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-24">
          <div className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-black mb-3">
              Available Courses
            </h2>
            <p className="text-gray-600">
              Choose from our curated selection of Islamic studies courses
            </p>
          </div>

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
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-24">
          <div className="bg-white border-2 border-black rounded-xl p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-black mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join Ilm Boost today and access comprehensive Islamic studies courses. 
              Start with a free account and upgrade anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Create Free Account
              </Link>
              <Link
                href="/membership"
                className="px-8 py-3 bg-[#F5E6D3] text-black font-semibold rounded-lg hover:bg-[#E8D4B8] transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Quiz Popup - Slides up from bottom */}
      {showQuizPopup && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-50 transition-opacity"
            onClick={() => {
              setShowQuizPopup(false);
              localStorage.setItem('quizPopupDismissed', 'true');
            }}
          />
          
          {/* Popup */}
          <div className="fixed bottom-0 left-0 right-0 z-50" style={{ animation: 'slideUp 0.4s ease-out' }}>
            <div className="max-w-2xl mx-auto px-4 pb-6">
              <div className="bg-white border-2 border-black rounded-t-xl rounded-b-xl shadow-2xl p-6 sm:p-8 relative">
                {/* Close Button */}
                <button
                  onClick={() => {
                    setShowQuizPopup(false);
                    localStorage.setItem('quizPopupDismissed', 'true');
                  }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-black mb-3">
                    Test Your Knowledge
                  </h2>
                  <p className="text-base text-gray-600 mb-6">
                    Challenge yourself with questions about Tafseer, Hadith Sciences, and Islamic studies.
                  </p>
                  <Link
                    href="/quiz"
                    onClick={() => {
                      setShowQuizPopup(false);
                      localStorage.setItem('quizPopupDismissed', 'true');
                    }}
                    className="inline-block px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Take the Quiz →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
