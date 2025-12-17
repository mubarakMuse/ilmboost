"use client";

import { useState, useEffect } from "react";
import { getAllCourses, getCourseById, getCourseBySlug } from "@/app/courses/courseUtils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CourseEditorPage() {
  const [course, setCourse] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [loadCourseId, setLoadCourseId] = useState("");
  const [isNewCourse, setIsNewCourse] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewSection, setPreviewSection] = useState(0);

  // Initialize empty course structure
  const initializeCourse = () => ({
    courseID: "",
    courseSlug: "",
    type: "",
    estimatedTime: "",
    teacher: "",
    courseTitle: "",
    courseImage: "",
    courseImageAlt: "",
    status: "Available Now",
    courseDescription: "",
    whatYouWillLearn: [],
    premium: false,
    sections: []
  });

  useEffect(() => {
    // Load all courses for the dropdown
    const courses = getAllCourses();
    setAllCourses(courses);
    
    // Initialize with empty course
    if (!course) {
      setCourse(initializeCourse());
    }
  }, []);

  const handleLoadCourse = () => {
    if (!loadCourseId) return;
    
    // Try loading by ID first, then by slug
    let loadedCourse = getCourseById(loadCourseId);
    if (!loadedCourse) {
      loadedCourse = getCourseBySlug(loadCourseId);
    }
    
    if (loadedCourse) {
      setCourse(JSON.parse(JSON.stringify(loadedCourse))); // Deep clone
      setIsNewCourse(false);
      setLoadCourseId(""); // Clear the select
    } else {
      alert("Course not found! Please select a course from the dropdown.");
    }
  };

  const handleNewCourse = () => {
    setCourse(initializeCourse());
    setIsNewCourse(true);
    setLoadCourseId("");
  };

  const updateCourseField = (field, value) => {
    setCourse(prev => ({ ...prev, [field]: value }));
  };

  const updateWhatYouWillLearn = (index, value) => {
    setCourse(prev => {
      const newList = [...prev.whatYouWillLearn];
      newList[index] = value;
      return { ...prev, whatYouWillLearn: newList };
    });
  };

  const addWhatYouWillLearn = () => {
    setCourse(prev => ({
      ...prev,
      whatYouWillLearn: [...prev.whatYouWillLearn, ""]
    }));
  };

  const removeWhatYouWillLearn = (index) => {
    setCourse(prev => ({
      ...prev,
      whatYouWillLearn: prev.whatYouWillLearn.filter((_, i) => i !== index)
    }));
  };

  const addSection = () => {
    setCourse(prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          sectionNumber: prev.sections.length + 1,
          sectionTitle: "",
          vocab: [],
          content: [],
          quiz: []
        }
      ]
    }));
  };

  const updateSection = (sectionIndex, field, value) => {
    setCourse(prev => {
      const newSections = [...prev.sections];
      newSections[sectionIndex] = { ...newSections[sectionIndex], [field]: value };
      return { ...prev, sections: newSections };
    });
  };

  const removeSection = (sectionIndex) => {
    setCourse(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== sectionIndex)
    }));
  };

  const addVocab = (sectionIndex) => {
    setCourse(prev => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].vocab = [
        ...newSections[sectionIndex].vocab,
        { term: "", meaning: "" }
      ];
      return { ...prev, sections: newSections };
    });
  };

  const updateVocab = (sectionIndex, vocabIndex, field, value) => {
    setCourse(prev => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].vocab[vocabIndex][field] = value;
      return { ...prev, sections: newSections };
    });
  };

  const removeVocab = (sectionIndex, vocabIndex) => {
    setCourse(prev => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].vocab = newSections[sectionIndex].vocab.filter((_, i) => i !== vocabIndex);
      return { ...prev, sections: newSections };
    });
  };

  const addContentItem = (sectionIndex, type = "paragraph") => {
    setCourse(prev => {
      const newSections = [...prev.sections];
      let newItem;
      if (type === "video" || type === "loom video") {
        newItem = { type, src: "", alt: "" };
      } else if (type === "list") {
        newItem = { type, items: [""] };
      } else {
        newItem = { type, text: "" };
      }
      newSections[sectionIndex].content = [
        ...newSections[sectionIndex].content,
        newItem
      ];
      return { ...prev, sections: newSections };
    });
  };

  const updateContentItem = (sectionIndex, contentIndex, field, value) => {
    setCourse(prev => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].content[contentIndex][field] = value;
      return { ...prev, sections: newSections };
    });
  };

  // Video URL conversion helpers (same as in section page)
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
    if (url.includes('youtube.com/embed')) return url.split('?')[0];
    return null;
  };

  const getLoomEmbedUrl = (url) => {
    if (!url) return null;
    const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([^/?]+)/);
    if (loomMatch) return `https://www.loom.com/embed/${loomMatch[1]}`;
    return null;
  };

  const renderPreviewContent = (content) => {
    switch (content.type) {
      case "heading":
        return <h3 className="text-2xl font-bold mt-8 mb-4">{content.text}</h3>;
      case "paragraph": {
        const processMarkdown = (text) => {
          if (!text) return '';
          return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
        };
        return (
          <p 
            className="text-base leading-relaxed mb-4"
            dangerouslySetInnerHTML={{ __html: processMarkdown(content.text) }}
          />
        );
      }
      case "quote":
        return (
          <blockquote className="border-l-4 border-black pl-4 py-2 my-4 italic bg-gray-50 rounded-r">
            {content.text}
          </blockquote>
        );
      case "list":
        return (
          <ul className="list-disc list-inside space-y-2 mb-4">
            {content.items?.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        );
      case "video": {
        const youtubeEmbed = getYouTubeEmbedUrl(content.src);
        if (youtubeEmbed) {
          return (
            <div className="my-6">
              <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-300 bg-gray-200">
                <iframe
                  src={youtubeEmbed}
                  title={content.alt || "Video content"}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              {content.alt && <p className="text-xs text-gray-600 mt-2">{content.alt}</p>}
            </div>
          );
        }
        return (
          <div className="my-6">
            <a href={content.src} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full">
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
              <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-300 bg-gray-200">
                <iframe
                  src={loomEmbed}
                  title={content.alt || "Loom video"}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              {content.alt && <p className="text-xs text-gray-600 mt-2">{content.alt}</p>}
            </div>
          );
        }
        return (
          <div className="my-6">
            <a href={content.src} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full">
              📹 Watch Loom Video: {content.alt || "Click to open video"}
            </a>
          </div>
        );
      }
      default:
        return null;
    }
  };

  const removeContentItem = (sectionIndex, contentIndex) => {
    setCourse(prev => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].content = newSections[sectionIndex].content.filter((_, i) => i !== contentIndex);
      return { ...prev, sections: newSections };
    });
  };

  const addQuizQuestion = (sectionIndex) => {
    setCourse(prev => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].quiz = [
        ...newSections[sectionIndex].quiz,
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: ""
        }
      ];
      return { ...prev, sections: newSections };
    });
  };

  const updateQuizQuestion = (sectionIndex, quizIndex, field, value) => {
    setCourse(prev => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].quiz[quizIndex][field] = value;
      return { ...prev, sections: newSections };
    });
  };

  const updateQuizOption = (sectionIndex, quizIndex, optionIndex, value) => {
    setCourse(prev => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].quiz[quizIndex].options[optionIndex] = value;
      return { ...prev, sections: newSections };
    });
  };

  const removeQuizQuestion = (sectionIndex, quizIndex) => {
    setCourse(prev => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].quiz = newSections[sectionIndex].quiz.filter((_, i) => i !== quizIndex);
      return { ...prev, sections: newSections };
    });
  };

  const downloadJSON = () => {
    if (!course) return;

    const courseJSON = JSON.stringify(course, null, 2);
    const blob = new Blob([courseJSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${course.courseSlug || course.courseID || "course"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!course) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#FAFAFA] py-12">
          <div className="max-w-4xl mx-auto px-4">
            <p>Loading...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAFAFA] py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif text-black mb-2">
                Course Editor
              </h1>
              <p className="text-gray-600">
                {isNewCourse ? "Create a new course" : `Editing: ${course.courseTitle || course.courseID}`}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="px-4 py-2 bg-[#F5E6D3] hover:bg-[#E8D4B8] text-black font-medium rounded-md transition-colors"
              >
                {previewMode ? "Edit Mode" : "Preview"}
              </button>
              <button
                onClick={handleNewCourse}
                className="px-4 py-2 bg-white hover:bg-gray-50 text-black font-medium border border-black rounded-md transition-colors"
              >
                New Course
              </button>
              <button
                onClick={downloadJSON}
                className="px-4 py-2 bg-black hover:bg-gray-800 text-white font-medium rounded-md transition-colors"
              >
                Download JSON
              </button>
            </div>
          </div>

          {/* Load Course */}
          <div className="bg-white border-2 border-black rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Load Existing Course</h2>
            <div className="flex gap-3">
              <select
                value={loadCourseId}
                onChange={(e) => setLoadCourseId(e.target.value)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-black"
              >
                <option value="">Select a course...</option>
                {allCourses.map((c) => (
                  <option key={c.courseID} value={c.courseID}>
                    {c.courseTitle} ({c.courseID})
                  </option>
                ))}
              </select>
              <button
                onClick={handleLoadCourse}
                disabled={!loadCourseId}
                className="px-6 py-2 bg-black hover:bg-gray-800 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Load
              </button>
            </div>
          </div>

          {/* Basic Course Info */}
          <div className="bg-white border-2 border-black rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Course ID *</label>
                  <input
                    type="text"
                    value={course.courseID}
                    onChange={(e) => updateCourseField("courseID", e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-black"
                    placeholder="e.g., TAF002"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Course Slug *</label>
                  <input
                    type="text"
                    value={course.courseSlug}
                    onChange={(e) => updateCourseField("courseSlug", e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-black"
                    placeholder="e.g., juz-amma-tafseer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <input
                    type="text"
                    value={course.type}
                    onChange={(e) => updateCourseField("type", e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-black"
                    placeholder="e.g., tafseer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Estimated Time</label>
                  <input
                    type="text"
                    value={course.estimatedTime}
                    onChange={(e) => updateCourseField("estimatedTime", e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-black"
                    placeholder="e.g., 10 hours"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Teacher</label>
                  <input
                    type="text"
                    value={course.teacher}
                    onChange={(e) => updateCourseField("teacher", e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={course.status}
                    onChange={(e) => updateCourseField("status", e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-black"
                  >
                    <option value="Available Now">Available Now</option>
                    <option value="Coming Soon">Coming Soon</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Course Title *</label>
                <input
                  type="text"
                  value={course.courseTitle}
                  onChange={(e) => updateCourseField("courseTitle", e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Course Description</label>
                <textarea
                  value={course.courseDescription}
                  onChange={(e) => updateCourseField("courseDescription", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-black"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Course Image Path</label>
                  <input
                    type="text"
                    value={course.courseImage}
                    onChange={(e) => updateCourseField("courseImage", e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-black"
                    placeholder="./app/courses/images/image.png"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Course Image Alt Text</label>
                  <input
                    type="text"
                    value={course.courseImageAlt}
                    onChange={(e) => updateCourseField("courseImageAlt", e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-black"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={course.premium}
                  onChange={(e) => updateCourseField("premium", e.target.checked)}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">Premium Course</label>
              </div>
            </div>
          </div>

          {/* What You Will Learn */}
          <div className="bg-white border-2 border-black rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">What You Will Learn</h2>
              <button
                onClick={addWhatYouWillLearn}
                className="px-4 py-2 bg-[#F5E6D3] hover:bg-[#E8D4B8] text-black font-medium rounded-md transition-colors"
              >
                + Add Item
              </button>
            </div>
            <div className="space-y-3">
              {course.whatYouWillLearn.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateWhatYouWillLearn(index, e.target.value)}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-black"
                    placeholder="Learning outcome..."
                  />
                  <button
                    onClick={() => removeWhatYouWillLearn(index)}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-md transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="bg-white border-2 border-black rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Sections</h2>
              <button
                onClick={addSection}
                className="px-4 py-2 bg-black hover:bg-gray-800 text-white font-medium rounded-md transition-colors"
              >
                + Add Section
              </button>
            </div>
            <div className="space-y-8">
              {course.sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="border-2 border-gray-300 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">Section {sectionIndex + 1}</h3>
                    <button
                      onClick={() => removeSection(sectionIndex)}
                      className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-md transition-colors"
                    >
                      Remove Section
                    </button>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Section Number</label>
                      <input
                        type="number"
                        value={section.sectionNumber}
                        onChange={(e) => updateSection(sectionIndex, "sectionNumber", parseInt(e.target.value))}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Section Title</label>
                      <input
                        type="text"
                        value={section.sectionTitle}
                        onChange={(e) => updateSection(sectionIndex, "sectionTitle", e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  {/* Vocabulary */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">Vocabulary</h4>
                      <button
                        onClick={() => addVocab(sectionIndex)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium rounded-md transition-colors"
                      >
                        + Add Term
                      </button>
                    </div>
                    <div className="space-y-2">
                      {section.vocab.map((vocab, vocabIndex) => (
                        <div key={vocabIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={vocab.term}
                            onChange={(e) => updateVocab(sectionIndex, vocabIndex, "term", e.target.value)}
                            placeholder="Term (Arabic)"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black text-sm"
                          />
                          <input
                            type="text"
                            value={vocab.meaning}
                            onChange={(e) => updateVocab(sectionIndex, vocabIndex, "meaning", e.target.value)}
                            placeholder="Meaning"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black text-sm"
                          />
                          <button
                            onClick={() => removeVocab(sectionIndex, vocabIndex)}
                            className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-md"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">Content</h4>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addContentItem(sectionIndex, "heading");
                          }}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium rounded-md transition-colors"
                        >
                          + Heading
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addContentItem(sectionIndex, "paragraph");
                          }}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium rounded-md transition-colors"
                        >
                          + Paragraph
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addContentItem(sectionIndex, "quote");
                          }}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium rounded-md transition-colors"
                        >
                          + Quote
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addContentItem(sectionIndex, "list");
                          }}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium rounded-md transition-colors"
                        >
                          + List
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addContentItem(sectionIndex, "video");
                          }}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium rounded-md transition-colors"
                        >
                          + YouTube
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addContentItem(sectionIndex, "loom video");
                          }}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium rounded-md transition-colors"
                        >
                          + Loom
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {section.content.map((contentItem, contentIndex) => (
                        <div key={contentIndex} className="border border-gray-200 rounded-md p-3">
                          <div className="flex justify-between items-center mb-2">
                            <select
                              value={contentItem.type}
                              onChange={(e) => {
                                const newType = e.target.value;
                                // Update type and reset fields based on type
                                if (newType === "video" || newType === "loom video") {
                                  updateContentItem(sectionIndex, contentIndex, "type", newType);
                                  if (!contentItem.src) {
                                    updateContentItem(sectionIndex, contentIndex, "src", "");
                                    updateContentItem(sectionIndex, contentIndex, "alt", "");
                                  }
                                } else if (newType === "list") {
                                  updateContentItem(sectionIndex, contentIndex, "type", newType);
                                  if (!contentItem.items) {
                                    updateContentItem(sectionIndex, contentIndex, "items", [""]);
                                  }
                                } else {
                                  updateContentItem(sectionIndex, contentIndex, "type", newType);
                                  if (!contentItem.text) {
                                    updateContentItem(sectionIndex, contentIndex, "text", "");
                                  }
                                }
                              }}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="heading">Heading</option>
                              <option value="paragraph">Paragraph</option>
                              <option value="quote">Quote</option>
                              <option value="list">List</option>
                              <option value="video">YouTube Video</option>
                              <option value="loom video">Loom Video</option>
                            </select>
                            <button
                              onClick={() => removeContentItem(sectionIndex, contentIndex)}
                              className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-md"
                            >
                              ×
                            </button>
                          </div>
                          {(contentItem.type === "video" || contentItem.type === "loom video") ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={contentItem.src || ""}
                                onChange={(e) => updateContentItem(sectionIndex, contentIndex, "src", e.target.value)}
                                placeholder={contentItem.type === "video" ? "YouTube URL (e.g., https://youtu.be/...)" : "Loom URL (e.g., https://loom.com/share/...)"}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black text-sm"
                              />
                              <input
                                type="text"
                                value={contentItem.alt || ""}
                                onChange={(e) => updateContentItem(sectionIndex, contentIndex, "alt", e.target.value)}
                                placeholder="Video description/alt text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black text-sm"
                              />
                            </div>
                          ) : contentItem.type === "list" ? (
                            <div className="space-y-2">
                              {(contentItem.items || [""]).map((item, itemIndex) => (
                                <div key={itemIndex} className="flex gap-2">
                                  <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => {
                                      const newItems = [...(contentItem.items || [""])];
                                      newItems[itemIndex] = e.target.value;
                                      updateContentItem(sectionIndex, contentIndex, "items", newItems);
                                    }}
                                    placeholder={`List item ${itemIndex + 1}`}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black text-sm"
                                  />
                                  <button
                                    onClick={() => {
                                      const newItems = (contentItem.items || [""]).filter((_, i) => i !== itemIndex);
                                      if (newItems.length === 0) newItems.push("");
                                      updateContentItem(sectionIndex, contentIndex, "items", newItems);
                                    }}
                                    className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-md"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const newItems = [...(contentItem.items || [""]), ""];
                                  updateContentItem(sectionIndex, contentIndex, "items", newItems);
                                }}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium rounded-md transition-colors"
                              >
                                + Add Item
                              </button>
                            </div>
                          ) : (
                            <textarea
                              value={contentItem.text || ""}
                              onChange={(e) => updateContentItem(sectionIndex, contentIndex, "text", e.target.value)}
                              rows={contentItem.type === "heading" ? 2 : 4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black text-sm"
                              placeholder={`Enter ${contentItem.type} text...`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quiz */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">Quiz Questions</h4>
                      <button
                        onClick={() => addQuizQuestion(sectionIndex)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium rounded-md transition-colors"
                      >
                        + Add Question
                      </button>
                    </div>
                    <div className="space-y-4">
                      {section.quiz.map((quizItem, quizIndex) => (
                        <div key={quizIndex} className="border border-gray-200 rounded-md p-4">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium">Question {quizIndex + 1}</span>
                            <button
                              onClick={() => removeQuizQuestion(sectionIndex, quizIndex)}
                              className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-md"
                            >
                              ×
                            </button>
                          </div>
                          <textarea
                            value={quizItem.question}
                            onChange={(e) => updateQuizQuestion(sectionIndex, quizIndex, "question", e.target.value)}
                            placeholder="Question text..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black text-sm mb-3"
                          />
                          <div className="space-y-2 mb-3">
                            {quizItem.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex gap-2">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateQuizOption(sectionIndex, quizIndex, optionIndex, e.target.value)}
                                  placeholder={`Option ${optionIndex + 1}`}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black text-sm"
                                />
                                <input
                                  type="radio"
                                  name={`correct-${sectionIndex}-${quizIndex}`}
                                  checked={quizItem.correctAnswer === option}
                                  onChange={() => updateQuizQuestion(sectionIndex, quizIndex, "correctAnswer", option)}
                                  className="mt-2"
                                />
                                <label className="text-sm mt-2">Correct</label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Mode */}
          {previewMode && (
            <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
              <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Preview Header */}
                <div className="mb-8 flex justify-between items-center">
                  <h2 className="text-2xl font-serif">Preview: {course.courseTitle || "Untitled Course"}</h2>
                  <button
                    onClick={() => setPreviewMode(false)}
                    className="px-4 py-2 bg-black hover:bg-gray-800 text-white font-medium rounded-md transition-colors"
                  >
                    Close Preview
                  </button>
                </div>

                {/* Course Info Preview */}
                <div className="mb-8 border-2 border-black rounded-xl p-6">
                  <h1 className="text-3xl font-serif mb-4">{course.courseTitle}</h1>
                  <p className="text-gray-600 mb-4">{course.courseDescription}</p>
                  {course.whatYouWillLearn.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-3">What You Will Learn</h3>
                      <ul className="space-y-2">
                        {course.whatYouWillLearn.map((item, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-black mr-2">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Section Preview Selector */}
                {course.sections.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Preview Section:</label>
                    <select
                      value={previewSection}
                      onChange={(e) => setPreviewSection(parseInt(e.target.value))}
                      className="px-4 py-2 border-2 border-black rounded-md"
                    >
                      {course.sections.map((section, idx) => (
                        <option key={idx} value={idx}>
                          Section {section.sectionNumber}: {section.sectionTitle || "Untitled"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Section Preview */}
                {course.sections[previewSection] && (
                  <div className="border-2 border-black rounded-xl p-6">
                    <h2 className="text-2xl font-semibold mb-4">
                      {course.sections[previewSection].sectionTitle || "Untitled Section"}
                    </h2>

                    {/* Vocabulary Preview */}
                    {course.sections[previewSection].vocab && course.sections[previewSection].vocab.length > 0 && (
                      <div className="mb-6 bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold mb-3">Key Vocabulary</h3>
                        <div className="space-y-2">
                          {course.sections[previewSection].vocab.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <div className="text-xl font-bold">{item.term}</div>
                              <div className="text-sm">{item.meaning}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Content Preview */}
                    {course.sections[previewSection].content && course.sections[previewSection].content.length > 0 && (
                      <div className="mb-6">
                        {course.sections[previewSection].content.map((content, idx) => (
                          <div key={idx}>
                            {renderPreviewContent(content)}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quiz Preview */}
                    {course.sections[previewSection].quiz && course.sections[previewSection].quiz.length > 0 && (
                      <div className="mt-6 border-t-2 border-gray-300 pt-6">
                        <h3 className="font-semibold mb-4">Quiz ({course.sections[previewSection].quiz.length} questions)</h3>
                        <div className="space-y-4">
                          {course.sections[previewSection].quiz.map((q, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-lg p-4">
                              <p className="font-medium mb-3">{q.question}</p>
                              <div className="space-y-2">
                                {q.options.map((opt, optIdx) => (
                                  <div key={optIdx} className={`p-2 rounded ${q.correctAnswer === opt ? 'bg-green-100 border border-green-500' : 'bg-gray-50'}`}>
                                    {opt} {q.correctAnswer === opt && '✓'}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Download Button at Bottom */}
          {!previewMode && (
            <div className="sticky bottom-0 bg-white border-t-2 border-black p-4 rounded-t-xl shadow-lg">
              <div className="flex justify-end">
                <button
                  onClick={downloadJSON}
                  className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-md transition-colors"
                >
                  Download Course JSON
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

