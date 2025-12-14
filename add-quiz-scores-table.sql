-- Migration: Add quiz_scores table
-- Run this in your Supabase SQL Editor

-- Quiz scores (for final course quizzes only)
CREATE TABLE IF NOT EXISTS public.quiz_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  score INTEGER NOT NULL, -- Percentage score (0-100)
  correct_answers INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  quiz_type TEXT DEFAULT 'final' CHECK (quiz_type IN ('final', 'section')), -- 'final' for course final quiz, 'section' for section quizzes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id, quiz_type) -- One score per user per course per quiz type
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_scores_user_id ON public.quiz_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_course_id ON public.quiz_scores(course_id);

-- Enable RLS
ALTER TABLE public.quiz_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Service role can manage quiz_scores" ON public.quiz_scores
  FOR ALL USING (true);

