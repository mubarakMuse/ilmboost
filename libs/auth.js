/**
 * Authentication System using Supabase
 * User data, enrollments, and progress stored in Supabase
 * Sessions stored in localStorage (simpler, no database table needed)
 */

const SESSION_KEY = 'ilmboost_session';
const SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

/**
 * Get session data from localStorage
 */
function getSession() {
  if (typeof window === 'undefined') return null;
  const sessionData = localStorage.getItem(SESSION_KEY);
  if (!sessionData) return null;
  
  try {
    const session = JSON.parse(sessionData);
    // Check if expired
    if (new Date().getTime() > new Date(session.expiresAt).getTime()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

/**
 * Set session in localStorage
 */
function setSession(user, expiresAt) {
  if (typeof window === 'undefined') return;
  const session = {
    user,
    expiresAt: expiresAt || new Date(Date.now() + SESSION_DURATION).toISOString()
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/**
 * Clear session
 */
function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

/**
 * Get user data from localStorage session
 */
export function getUser() {
  if (typeof window === 'undefined') return null;
  
  const session = getSession();
  return session?.user || null;
}

/**
 * Check if user has active session
 */
export function hasActiveSession() {
  if (typeof window === 'undefined') return false;
  
  const session = getSession();
  return session !== null;
}

/**
 * Get user membership tier
 */
export function getUserMembership() {
  const user = getUser();
  if (!user) return null;
  return user.membership || 'free';
}

/**
 * Check if user has paid membership (legacy - for backward compatibility)
 */
export function hasPaidMembership() {
  const membership = getUserMembership();
  return membership === 'paid' || membership === 'monthly' || membership === 'yearly';
}

/**
 * Check if user has an active license
 */
export async function hasActiveLicense() {
  if (typeof window === 'undefined') return false;
  
  const user = getUser();
  if (!user) return false;

  try {
    const response = await fetch(`/api/licenses/check?userId=${user.id}`);
    const data = await response.json();
    return data.success && data.hasLicense === true;
  } catch (error) {
    console.error('Check license error:', error);
    return false;
  }
}

/**
 * Login user (create session)
 */
export async function login(email, pin) {
  if (typeof window === 'undefined') return { success: false, error: 'Not in browser' };
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, pin })
    });

    const data = await response.json();
    
    if (data.success) {
      setSession(data.user, data.expiresAt);
      return { success: true, user: data.user };
    }
    
    return { success: false, error: data.error || 'Login failed' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

/**
 * Signup new user
 */
export async function signup(userData) {
  if (typeof window === 'undefined') return { success: false, error: 'Not in browser' };
  
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        dobMonth: userData.dobMonth,
        dobYear: userData.dobYear,
        pin: userData.pin,
        secretAnswer: userData.secretAnswer,
        membership: userData.membership || 'free'
      })
    });

    const data = await response.json();
    
    if (data.success) {
      setSession(data.user, data.expiresAt);
      return { success: true, user: data.user };
    }
    
    return { success: false, error: data.error || 'Signup failed' };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

/**
 * Logout user
 */
export function logout() {
  if (typeof window === 'undefined') return;
  clearSession();
}

/**
 * Reset PIN using secret question
 */
export async function resetPin(email, secretAnswer, newPin) {
  // TODO: Implement API route for reset PIN
  return { success: false, error: 'Not implemented yet' };
}

/**
 * Update membership tier
 */
export async function updateMembership(email, membership) {
  // TODO: Implement API route for update membership
  return { success: false, error: 'Not implemented yet' };
}

/**
 * Check if a course is premium (requires license)
 */
export function isPremiumCourse(courseId) {
  if (typeof window === 'undefined') return false;
  
  // Import courseUtils dynamically to avoid SSR issues
  try {
    const { isPremiumCourse: checkPremium } = require('@/app/courses/courseUtils');
    return checkPremium(courseId);
  } catch (error) {
    // Fallback: default to free
    return false;
  }
}

/**
 * Check if user can access course (based on license and course type)
 */
export async function canAccessCourse(courseId) {
  const hasSession = hasActiveSession();
  
  if (!hasSession) return false;
  
  // Free courses are accessible to everyone
  if (!isPremiumCourse(courseId)) {
    return true;
  }
  
  // Premium courses require an active license
  const hasLicense = await hasActiveLicense();
  
  return hasLicense;
}

/**
 * Enrollment Management
 */
export async function getEnrollments() {
  if (typeof window === 'undefined') return [];
  
  const user = getUser();
  if (!user) return [];

  try {
    const response = await fetch(`/api/courses/enroll?userId=${user.id}`);
    const data = await response.json();
    return data.success ? (data.enrollments || []) : [];
  } catch (error) {
    console.error('Get enrollments error:', error);
    return [];
  }
}

export async function isEnrolled(courseId) {
  const enrollments = await getEnrollments();
  return enrollments.includes(courseId);
}

export async function enrollInCourse(courseId) {
  if (typeof window === 'undefined') return { success: false };
  
  const user = getUser();
  if (!user) return { success: false, error: 'Not logged in' };

  // Check if course is premium and user has license
  const { isPremiumCourse } = require('@/app/courses/courseUtils');
  if (isPremiumCourse(courseId)) {
    const hasLicense = await hasActiveLicense();
    if (!hasLicense) {
      return { 
        success: false, 
        error: 'License required',
        message: 'This is a premium course. Please purchase or activate a license to enroll.'
      };
    }
  }

  try {
    const response = await fetch('/api/courses/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, courseId })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Enroll error:', error);
    return { success: false, error: 'Failed to enroll' };
  }
}

export async function unenrollFromCourse(courseId) {
  if (typeof window === 'undefined') return { success: false };
  
  const user = getUser();
  if (!user) return { success: false, error: 'Not logged in' };

  try {
    const response = await fetch(`/api/courses/enroll?userId=${user.id}&courseId=${courseId}`, {
      method: 'DELETE'
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Unenroll error:', error);
    return { success: false, error: 'Failed to unenroll' };
  }
}

/**
 * Progress Tracking
 */
export async function getProgress() {
  if (typeof window === 'undefined') return {};
  
  const user = getUser();
  if (!user) return {};

  try {
    const response = await fetch(`/api/courses/progress?userId=${user.id}`);
    const data = await response.json();
    return data.success ? (data.progress || {}) : {};
  } catch (error) {
    console.error('Get progress error:', error);
    return {};
  }
}

export async function getCourseProgress(courseId) {
  const user = getUser();
  if (!user) {
    return {
      completedSections: [],
      lastAccessed: null
    };
  }

  try {
    const response = await fetch(`/api/courses/progress?userId=${user.id}&courseId=${courseId}`);
    const data = await response.json();
    
    if (data.success && data.progress) {
      return {
        completedSections: data.progress.completedSections || [],
        lastAccessed: data.progress.lastAccessed
      };
    }
    
    return {
      completedSections: [],
      lastAccessed: null
    };
  } catch (error) {
    console.error('Get course progress error:', error);
    return {
      completedSections: [],
      lastAccessed: null
    };
  }
}

export async function markSectionComplete(courseId, sectionNumber) {
  if (typeof window === 'undefined') return { success: false };
  
  const user = getUser();
  if (!user) return { success: false, error: 'Not logged in' };

  try {
    const response = await fetch('/api/courses/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        courseId,
        sectionNumber,
        action: 'complete'
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Mark complete error:', error);
    return { success: false, error: 'Failed to update progress' };
  }
}

export async function markSectionIncomplete(courseId, sectionNumber) {
  if (typeof window === 'undefined') return { success: false };
  
  const user = getUser();
  if (!user) return { success: false, error: 'Not logged in' };

  try {
    const response = await fetch('/api/courses/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        courseId,
        sectionNumber,
        action: 'incomplete'
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Mark incomplete error:', error);
    return { success: false, error: 'Failed to update progress' };
  }
}

export async function clearCourseProgress(courseId) {
  // Progress is cleared automatically when unenrolling
  return { success: true };
}

export async function getCourseProgressPercentage(courseId, totalSections) {
  const courseProgress = await getCourseProgress(courseId);
  if (totalSections === 0) return 0;
  return Math.round((courseProgress.completedSections.length / totalSections) * 100);
}

/**
 * Update user PIN (requires current PIN)
 */
export async function updatePin(currentPin, newPin) {
  // TODO: Implement API route for update PIN
  return { success: false, error: 'Not implemented yet' };
}

/**
 * Update user profile information
 */
export async function updateProfile(updates) {
  // TODO: Implement API route for update profile
  return { success: false, error: 'Not implemented yet' };
}

/**
 * Quiz Score Management
 */
export async function saveQuizScore(courseId, score, correctAnswers, totalQuestions, quizType = 'final') {
  if (typeof window === 'undefined') return { success: false };
  
  const user = getUser();
  if (!user) return { success: false, error: 'Not logged in' };

  try {
    const response = await fetch('/api/courses/quiz-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        courseId,
        score,
        correctAnswers,
        totalQuestions,
        quizType
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Save quiz score error:', error);
    return { success: false, error: 'Failed to save score' };
  }
}

export async function getQuizScore(courseId, quizType = 'final') {
  if (typeof window === 'undefined') return null;
  
  const user = getUser();
  if (!user) return null;

  try {
    const response = await fetch(`/api/courses/quiz-score?userId=${user.id}&courseId=${courseId}&quizType=${quizType}`);
    const data = await response.json();
    
    if (data.success && data.highScore) {
      return data.highScore;
    }
    
    return null;
  } catch (error) {
    console.error('Get quiz score error:', error);
    return null;
  }
}
