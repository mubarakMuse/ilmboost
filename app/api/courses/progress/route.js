import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
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

    // Verify user exists
    const { data: user } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 401 }
      );
    }

    if (courseId) {
      // Get progress for specific course
      const { data: progress } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      return NextResponse.json({
        success: true,
        progress: progress ? {
          completedSections: progress.completed_sections || [],
          lastAccessed: progress.last_accessed
        } : {
          completedSections: [],
          lastAccessed: null
        }
      });
    } else {
      // Get all progress
      const { data: progressList } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', userId);

      const progressMap = {};
      progressList?.forEach(p => {
        progressMap[p.course_id] = {
          completedSections: p.completed_sections || [],
          lastAccessed: p.last_accessed
        };
      });

      return NextResponse.json({ success: true, progress: progressMap });
    }
  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, courseId, sectionNumber, action } = body; // action: 'complete' or 'incomplete'

    if (!userId || !courseId || !sectionNumber || !action) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
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

    // Verify user exists
    const { data: user } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 401 }
      );
    }

    // Get current progress
    const { data: currentProgress } = await supabase
      .from('course_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    let completedSections = currentProgress?.completed_sections || [];

    if (action === 'complete') {
      if (!completedSections.includes(sectionNumber)) {
        completedSections.push(sectionNumber);
      }
    } else if (action === 'incomplete') {
      completedSections = completedSections.filter(s => s !== sectionNumber);
    }

    // Upsert progress
    const { error } = await supabase
      .from('course_progress')
      .upsert({
        user_id: userId,
        course_id: courseId,
        completed_sections: completedSections,
        last_accessed: new Date().toISOString()
      }, {
        onConflict: 'user_id,course_id'
      });

    if (error) {
      console.error('Progress update error:', error);
      return NextResponse.json(
        { success: false, error: "Failed to update progress" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update progress error:', error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

