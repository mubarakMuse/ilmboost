"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCourseBySlug, getCourseImageUrl } from "../../courseUtils";
import { hasActiveSession, isEnrolled, getCourseProgress, markSectionComplete, markSectionIncomplete } from "@/libs/auth";

const SectionPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;
  const sectionNum = parseInt(params?.section);
  const [courseData, setCourseData] = useState(null);
  const [section, setSection] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);

  useEffect(() => {
    if (!slug || !sectionNum) return;

    const course = getCourseBySlug(slug);
    if (!course) {
      router.push('/dashboard');
      return;
    }

    const sectionData = course.sections?.find(s => s.sectionNumber === sectionNum);
    if (!sectionData) {
      router.push(`/courses/${slug}`);
      return;
    }

    setCourseData(course);
    setSection(sectionData);

    const loggedIn = hasActiveSession();
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      const checkEnrollment = async () => {
        const isEnrolledInCourse = await isEnrolled(course.courseID);
        setEnrolled(isEnrolledInCourse);

        if (isEnrolledInCourse) {
          const progress = await getCourseProgress(course.courseID);
          setIsCompleted(progress.completedSections?.includes(sectionNum) || false);
        }
        setIsLoading(false);
      };
      checkEnrollment();
    } else {
      setIsLoading(false);
    }
  }, [slug, sectionNum, router]);

  // Refresh completion status when page becomes visible (e.g., returning from quiz)
  useEffect(() => {
    if (!enrolled || !courseData) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const progress = await getCourseProgress(courseData.courseID);
          setIsCompleted(progress.completedSections?.includes(sectionNum) || false);
        } catch (error) {
          console.error('Error refreshing progress:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enrolled, courseData?.courseID, sectionNum]);

  const handleToggleComplete = async () => {
    if (!enrolled || !courseData) return;

    if (isCompleted) {
      await markSectionIncomplete(courseData.courseID, sectionNum);
      setIsCompleted(false);
    } else {
      await markSectionComplete(courseData.courseID, sectionNum);
      setIsCompleted(true);
    }
  };

  const getNextSection = () => {
    if (!courseData) return null;
    const nextNum = sectionNum + 1;
    return courseData.sections?.find(s => s.sectionNumber === nextNum);
  };

  const getPrevSection = () => {
    if (!courseData) return null;
    const prevNum = sectionNum - 1;
    return courseData.sections?.find(s => s.sectionNumber === prevNum);
  };

  // Convert YouTube URL to embeddable format
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    
    // Handle youtu.be short URLs
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch) {
      return `https://www.youtube.com/embed/${shortMatch[1]}`;
    }
    
    // Handle youtube.com/watch URLs
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) {
      return `https://www.youtube.com/embed/${watchMatch[1]}`;
    }
    
    // Handle youtube.com/embed URLs (already embeddable)
    if (url.includes('youtube.com/embed')) {
      return url.split('?')[0]; // Remove query params
    }
    
    return null;
  };

  // Convert Loom URL to embeddable format
  const getLoomEmbedUrl = (url) => {
    if (!url) return null;
    
    // Extract Loom video ID from various URL formats
    const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([^/?]+)/);
    if (loomMatch) {
      return `https://www.loom.com/embed/${loomMatch[1]}`;
    }
    
    return null;
  };

  const renderContent = (content) => {
    switch (content.type) {
      case "heading":
        return (
          <h3 className="text-2xl font-bold mt-8 mb-4 text-base-content">
            {content.text}
          </h3>
        );
      case "paragraph": {
        // Handle markdown bold (**text**) and italic (*text*)
        const processMarkdown = (text) => {
          if (!text) return '';
          return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
        };
        return (
          <p 
            className="text-base leading-relaxed mb-4 text-base-content/90"
            dangerouslySetInnerHTML={{ __html: processMarkdown(content.text) }}
          />
        );
      }
      case "list":
        return (
          <ul className="list-disc list-inside space-y-2 mb-4 text-base-content/90">
            {content.items?.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').split('\n').map((line, i) => (
                  <span key={i} dangerouslySetInnerHTML={{ __html: line }} />
                ))}
              </li>
            ))}
          </ul>
        );
      case "quote":
        return (
          <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 italic text-base-content/80 bg-base-200 rounded-r">
            {content.text}
          </blockquote>
        );
      case "video": {
        const youtubeEmbed = getYouTubeEmbedUrl(content.src);
        if (youtubeEmbed) {
          return (
            <div className="my-6">
              <div className="aspect-video w-full rounded-lg overflow-hidden border border-base-300 bg-base-200">
                <iframe
                  src={youtubeEmbed}
                  title={content.alt || "Video content"}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              {content.alt && (
                <p className="text-xs text-base-content/60 mt-2">{content.alt}</p>
              )}
            </div>
          );
        }
        // Fallback: show link if URL can't be embedded
        return (
          <div className="my-6">
            <a
              href={content.src}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline w-full"
            >
              📹 Watch Video: {content.alt || "Click to open video"}
            </a>
          </div>
        );
      }
      case "loom video": {
        const loomEmbed = getLoomEmbedUrl(content.src);
        if (loomEmbed) {
          return (
            <div className="my-6">
              <div className="aspect-video w-full rounded-lg overflow-hidden border border-base-300 bg-base-200">
                <iframe
                  src={loomEmbed}
                  title={content.alt || "Loom video"}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              {content.alt && (
                <p className="text-xs text-base-content/60 mt-2">{content.alt}</p>
              )}
            </div>
          );
        }
        // Fallback: show link if URL can't be embedded
        return (
          <div className="my-6">
            <a
              href={content.src}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline w-full"
            >
              📹 Watch Loom Video: {content.alt || "Click to open video"}
            </a>
          </div>
        );
      }
      default:
        return null;
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

  if (!section || !courseData) {
    return null;
  }

  const nextSection = getNextSection();
  const prevSection = getPrevSection();
  const hasQuiz = section.quiz && Array.isArray(section.quiz) && section.quiz.length > 0;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-base-100 pb-20">
        {/* Mobile-Optimized Header */}
        <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link 
                href={`/courses/${slug}`}
                className="btn btn-ghost btn-sm"
              >
                ← Back
              </Link>
              <div className="text-xs text-base-content/60">
                Section {sectionNum} of {courseData.sections?.length || 0}
              </div>
            </div>
            <h1 className="text-lg font-bold mt-2 text-base-content line-clamp-2">
              {section.sectionTitle}
            </h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Progress Indicator - Minimal */}
          {enrolled && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Section Status</span>
                {isCompleted ? (
                  <span className="badge badge-success badge-sm">✓ Completed</span>
                ) : hasQuiz ? (
                  <span className="badge badge-warning badge-sm">Quiz Required</span>
                ) : (
                  <span className="badge badge-info badge-sm">In Progress</span>
                )}
              </div>
              {hasQuiz && !isCompleted && (
                <p className="text-xs text-base-content/60 mt-1">
                  Complete the quiz to mark this section as complete
                </p>
              )}
            </div>
          )}

          {/* Login/Enroll Prompt */}
          {!isLoggedIn && (
            <div className="alert alert-info mb-6">
              <div>
                <h3 className="font-bold text-sm">Login Required</h3>
                <p className="text-xs">Please login to view full content and track progress.</p>
                <Link href="/login" className="btn btn-sm btn-primary mt-2">
                  Login
                </Link>
              </div>
            </div>
          )}

          {isLoggedIn && !enrolled && (
            <div className="alert alert-warning mb-6">
              <div>
                <h3 className="font-bold text-sm">Enrollment Required</h3>
                <p className="text-xs">Please enroll in this course to view full content.</p>
                <Link href="/dashboard" className="btn btn-sm btn-primary mt-2">
                  Enroll Now
                </Link>
              </div>
            </div>
          )}

          {/* Vocabulary Section */}
          {section.vocab && section.vocab.length > 0 && (
            <div className="card bg-base-200 mb-6">
              <div className="card-body p-4">
                <h2 className="card-title text-lg mb-3">Key Vocabulary</h2>
                <div className="grid grid-cols-1 gap-3">
                  {section.vocab.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-base-100 rounded-lg">
                      <div className="text-2xl font-bold text-primary flex-shrink-0">
                        {item.term}
                      </div>
                      <div className="text-sm text-base-content/80 flex-1">
                        {item.meaning}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Course Content */}
          {enrolled && section.content && section.content.length > 0 && (
            <div className="mb-6">
              <div className="prose prose-sm max-w-none">
                {section.content.map((content, idx) => (
                  <div key={idx}>
                    {renderContent(content)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Not Enrolled - Show Preview */}
          {!enrolled && section.content && section.content.length > 0 && (
            <div className="alert alert-info mb-6">
              <div>
                <p className="text-sm">Enroll in this course to view the full content.</p>
              </div>
            </div>
          )}

          {/* Action Buttons - Minimal UX */}
          <div className="sticky bottom-0 bg-base-100 border-t border-base-300 py-4 -mx-4 px-4 mt-8 shadow-lg">
            <div className="flex flex-col gap-3">
              {/* Quiz Button - Primary Action */}
              {isLoggedIn && enrolled && hasQuiz && (
                <Link
                  href={`/courses/${slug}/quiz?section=${sectionNum}`}
                  className={`btn w-full ${isCompleted ? 'btn-success' : 'btn-primary'}`}
                >
                  {isCompleted ? (
                    <>
                      ✓ Section Completed - Retake Quiz ({section.quiz.length} questions)
                    </>
                  ) : (
                    <>
                      Complete Section Quiz ({section.quiz.length} questions)
                    </>
                  )}
                </Link>
              )}

              {/* Manual Complete for sections without quiz */}
              {isLoggedIn && enrolled && !hasQuiz && (
                <button
                  onClick={handleToggleComplete}
                  className={`btn w-full ${isCompleted ? 'btn-success' : 'btn-outline'}`}
                >
                  {isCompleted ? '✓ Section Completed' : 'Mark as Complete'}
                </button>
              )}

              {/* Navigation */}
              <div className="grid grid-cols-2 gap-3">
                {prevSection ? (
                  <Link
                    href={`/courses/${slug}/${prevSection.sectionNumber}`}
                    className="btn btn-outline"
                  >
                    ← Previous
                  </Link>
                ) : (
                  <div></div>
                )}
                {nextSection ? (
                  <Link
                    href={`/courses/${slug}/${nextSection.sectionNumber}`}
                    className="btn btn-primary"
                    disabled={!isCompleted && hasQuiz}
                  >
                    Next →
                  </Link>
                ) : (
                  <Link
                    href={`/courses/${slug}`}
                    className="btn btn-primary"
                  >
                    Back to Course
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SectionPage;

