import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, courseId, score, correctAnswers, totalQuestions, quizType = 'final' } = body;

    if (!userId || !courseId || score === undefined || !correctAnswers || !totalQuestions) {
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
        { status: 404 }
      );
    }

    // Check if score already exists for this user/course/quiz type
    const { data: existingScore } = await supabase
      .from('quiz_scores')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('quiz_type', quizType)
      .single();

    if (existingScore) {
      // Only update if new score is higher
      if (score > existingScore.score) {
        const { error } = await supabase
          .from('quiz_scores')
          .update({
            score,
            correct_answers: correctAnswers,
            total_questions: totalQuestions,
            created_at: new Date().toISOString()
          })
          .eq('id', existingScore.id);

        if (error) {
          console.error('Error updating quiz score:', error);
          return NextResponse.json(
            { success: false, error: "Failed to update score" },
            { status: 500 }
          );
        }

        return NextResponse.json({ 
          success: true, 
          message: "New high score saved!",
          isNewHighScore: true,
          previousScore: existingScore.score,
          newScore: score
        });
      } else {
        return NextResponse.json({ 
          success: true, 
          message: "Score saved (not a new high score)",
          isNewHighScore: false,
          currentHighScore: existingScore.score,
          attemptedScore: score
        });
      }
    } else {
      // Insert new score
      const { error } = await supabase
        .from('quiz_scores')
        .insert({
          user_id: userId,
          course_id: courseId,
          score,
          correct_answers: correctAnswers,
          total_questions: totalQuestions,
          quiz_type: quizType
        });

      if (error) {
        console.error('Error saving quiz score:', error);
        return NextResponse.json(
          { success: false, error: "Failed to save score" },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        message: "Score saved!",
        isNewHighScore: true,
        newScore: score
      });
    }
  } catch (error) {
    console.error('Quiz score error:', error);
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
    const courseId = searchParams.get('courseId');
    const quizType = searchParams.get('quizType') || 'final';

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
        { status: 404 }
      );
    }

    let query = supabase
      .from('quiz_scores')
      .select('*')
      .eq('user_id', userId)
      .eq('quiz_type', quizType);

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data: scores, error } = await query.order('score', { ascending: false });

    if (error) {
      console.error('Error fetching quiz scores:', error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch scores" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      scores: scores || [],
      highScore: courseId && scores && scores.length > 0 ? scores[0] : null
    });
  } catch (error) {
    console.error('Get quiz scores error:', error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

