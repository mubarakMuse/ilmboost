import coursesData from './courses.json';

// Cache the courses data to avoid re-parsing
let coursesCache = null;
let coursesMetadataCache = null;

/**
 * Get all courses from the catalog (full data with sections)
 * @returns {Array} Array of all courses with complete data
 */
export function getAllCourses() {
  if (coursesCache) return coursesCache;
  coursesCache = coursesData.courses || [];
  return coursesCache;
}

/**
 * Get lightweight course metadata (without sections, vocab, content, quiz)
 * Use this for listings to improve performance
 * @returns {Array} Array of course metadata objects
 */
export function getAllCoursesMetadata() {
  if (coursesMetadataCache) return coursesMetadataCache;
  
  const courses = coursesData.courses || [];
  coursesMetadataCache = courses.map(course => ({
    courseID: course.courseID,
    courseSlug: course.courseSlug,
    type: course.type,
    estimatedTime: course.estimatedTime,
    teacher: course.teacher,
    courseTitle: course.courseTitle,
    courseImage: course.courseImage,
    courseImageAlt: course.courseImageAlt,
    status: course.status || 'Available Now',
    courseDescription: course.courseDescription,
    whatYouWillLearn: course.whatYouWillLearn || [],
    premium: course.premium || false,
    // Include section count for progress calculations, but not full sections
    sectionCount: course.sections?.length || 0,
  }));
  
  return coursesMetadataCache;
}

/**
 * Get a course by its slug (full data)
 * Optimized to search directly without loading all courses first
 * @param {string} slug - The course slug
 * @returns {Object|null} The course object or null if not found
 */
export function getCourseBySlug(slug) {
  const courses = coursesData.courses || [];
  return courses.find(course => course.courseSlug === slug) || null;
}

/**
 * Get a course by its ID (full data)
 * Optimized to search directly without loading all courses first
 * @param {string} courseID - The course ID
 * @returns {Object|null} The course object or null if not found
 */
export function getCourseById(courseID) {
  const courses = coursesData.courses || [];
  return courses.find(course => course.courseID === courseID) || null;
}

/**
 * Check if a course is premium (requires license)
 * @param {string|Object} courseIdOrCourse - Course ID or course object
 * @returns {boolean} True if course is premium
 */
export function isPremiumCourse(courseIdOrCourse) {
  let course = null;
  
  if (typeof courseIdOrCourse === 'string') {
    // If it's a course ID, find the course
    course = getCourseById(courseIdOrCourse);
  } else {
    // If it's a course object, use it directly
    course = courseIdOrCourse;
  }
  
  if (!course) return false;
  
  // Check if course has premium field (add this to courses.json for premium courses)
  return course.premium === true;
}

/**
 * Convert course image path to public URL
 * @param {string} imagePath - The image path from JSON
 * @returns {string} The public URL path
 */
export function getCourseImageUrl(imagePath) {
  if (!imagePath) return null;
  
  // Handle relative paths like ./app/courses/images/file.png or ./app/islamic-studies/images/file.png
  if (imagePath.startsWith('./app/courses/images/')) {
    return imagePath.replace('./app/courses/images/', '/courses/images/');
  }
  if (imagePath.startsWith('./app/islamic-studies/images/')) {
    return imagePath.replace('./app/islamic-studies/images/', '/courses/images/');
  }
  
  // Handle paths that already start with /
  if (imagePath.startsWith('/')) {
    // Replace old paths
    if (imagePath.startsWith('/islamic-studies/images/')) {
      return imagePath.replace('/islamic-studies/images/', '/courses/images/');
    }
    return imagePath;
  }
  
  // Handle just filename
  if (!imagePath.includes('/')) {
    return `/courses/images/${imagePath}`;
  }
  
  // Default: extract filename and use it
  const filename = imagePath.split('/').pop();
  return `/courses/images/${filename}`;
}
