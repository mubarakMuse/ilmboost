import coursesData from './courses.json';

/**
 * Get all courses from the catalog
 * @returns {Array} Array of all courses
 */
export function getAllCourses() {
  return coursesData.courses || [];
}

/**
 * Get a course by its slug
 * @param {string} slug - The course slug
 * @returns {Object|null} The course object or null if not found
 */
export function getCourseBySlug(slug) {
  const courses = getAllCourses();
  return courses.find(course => course.courseSlug === slug) || null;
}

/**
 * Get a course by its ID
 * @param {string} courseID - The course ID
 * @returns {Object|null} The course object or null if not found
 */
export function getCourseById(courseID) {
  const courses = getAllCourses();
  return courses.find(course => course.courseID === courseID) || null;
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
