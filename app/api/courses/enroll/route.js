import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import coursesData from "@/app/courses/courses.json";

// Helper to check if course is premium
function isPremiumCourse(courseId) {
  const course = coursesData.courses?.find(c => c.courseID === courseId);
  return course?.premium === true;
}

// Helper to check if user has active license
async function hasActiveLicense(supabase, userId) {
  const now = new Date().toISOString();
  
  // Check if user owns an active license
  const { data: ownedLicense } = await supabase
    .from('licenses')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .gt('expires_at', now)
    .maybeSingle();
  
  if (ownedLicense) return true;
  
  // Check if user is part of a shared license
  const { data: sharedLicense } = await supabase
    .from('license_users')
    .select('licenses!inner(id, status, expires_at)')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (sharedLicense?.licenses) {
    const license = sharedLicense.licenses;
    return license.status === 'active' && new Date(license.expires_at) > new Date(now);
  }
  
  return false;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, courseId } = body;

    if (!userId || !courseId) {
      return NextResponse.json(
        { success: false, error: "User ID and course ID required" },
        { status: 400 }
      );
    }

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { persistSession: false },
        realtime: { disabled: true }
      }
    );

    // Verify user exists (session validation handled on frontend)
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (userError || !user) {
      console.error('User lookup error:', userError);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if course is premium and user has license
    if (isPremiumCourse(courseId)) {
      const hasLicense = await hasActiveLicense(supabase, userId);
      if (!hasLicense) {
        return NextResponse.json(
          { 
            success: false, 
            error: "License required",
            message: "This is a premium course. Please purchase or activate a license to enroll."
          },
          { status: 403 }
        );
      }
    }

    // Check if already enrolled
    const { data: existing } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true, message: "Already enrolled" });
    }

    // Enroll
    const { error } = await supabase
      .from('course_enrollments')
      .insert({
        user_id: userId,
        course_id: courseId
      });

    if (error) {
      console.error('Enrollment error:', error);
      return NextResponse.json(
        { success: false, error: "Failed to enroll" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Enroll error:', error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');

    if (!userId || !courseId) {
      return NextResponse.json(
        { success: false, error: "User ID and course ID required" },
        { status: 400 }
      );
    }

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { persistSession: false },
        realtime: { disabled: true }
      }
    );

    // Verify user exists (session validation handled on frontend)
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (userError || !user) {
      console.error('User lookup error:', userError);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Unenroll
    await supabase
      .from('course_enrollments')
      .delete()
      .eq('user_id', userId)
      .eq('course_id', courseId);

    // Clear progress
    await supabase
      .from('course_progress')
      .delete()
      .eq('user_id', userId)
      .eq('course_id', courseId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unenroll error:', error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { persistSession: false },
        realtime: { disabled: true }
      }
    );

    // Verify user exists (session validation handled on frontend)
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (userError || !user) {
      console.error('User lookup error:', userError);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Get enrollments
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('course_id')
      .eq('user_id', userId);

    const courseIds = enrollments?.map(e => e.course_id) || [];

    return NextResponse.json({ success: true, enrollments: courseIds });
  } catch (error) {
    console.error('Get enrollments error:', error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

