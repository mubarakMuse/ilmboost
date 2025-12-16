import React from "react";
import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import { getAllCoursesMetadata, getCourseImageUrl } from "./courseUtils";
import CourseImage from "./components/CourseImage";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Courses - ${config.appName}`,
  description: "Structured, online Islamic education for the modern family. Learn Islamic studies from qualified teachers in a flexible, accessible format.",
  keywords: ["Islamic studies", "online Islamic education", "Quran classes", "Islamic learning", "Muslim education", "online religious education"],
  canonicalUrlRelative: "/courses",
});

const IslamicStudies = () => {
  const courses = getAllCoursesMetadata();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-base-100">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-3 text-base-content">
              Online Islamic Studies
            </h1>
            <p className="text-lg text-base-content/70">
              Structured, online Islamic education for the modern family.
            </p>
          </div>

          <div className="mb-12">
            <div className="text-base leading-relaxed space-y-4 text-base-content/80">
              <p>
                We provide structured, comprehensive Islamic education online. Our curriculum is designed for modern families who want authentic Islamic knowledge that fits into their busy lives.
              </p>
              <p>
                Learn from qualified teachers, study at your own pace, and connect with a community of learners committed to understanding their faith.
              </p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-base-content">Available Courses</h2>
            <div className="space-y-6">
              {courses.map((course) => {
                const isAvailable = course.status === "Available Now";
                const CourseCard = (
                  <div key={course.courseID} className={`card card-border transition-colors ${
                    isAvailable 
                      ? 'hover:shadow-lg' 
                      : 'opacity-75'
                  }`}>
                    <div className="card-body">
                      <div className="flex gap-4">
                        {course.courseImage && (
                          <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-base-300 bg-base-200">
                            <CourseImage
                              src={getCourseImageUrl(course.courseImage)}
                              alt={course.courseImageAlt || course.courseTitle}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
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
                          <p className="text-sm leading-relaxed text-base-content/70 mb-3">
                            {course.courseDescription}
                          </p>
                          {isAvailable ? (
                            <Link 
                              href={`/courses/${course.courseSlug}`}
                              className="link link-primary text-sm font-medium"
                            >
                              View Course →
                            </Link>
                          ) : (
                            <span className="text-sm text-base-content/40">
                              Coming Soon
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );

                return isAvailable ? (
                  <Link key={course.courseID} href={`/courses/${course.courseSlug}`} className="block">
                    {CourseCard}
                  </Link>
                ) : (
                  CourseCard
                );
              })}
            </div>
          </div>

          <div className="pt-8 border-t border-base-300">
            <a 
              href="mailto:Mubarak014@gmail.com?subject=Islamic Studies Inquiry" 
              className="btn btn-primary"
            >
              Contact Us
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default IslamicStudies;
