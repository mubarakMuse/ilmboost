-- Ilm Boost Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users/Profiles table (Custom PIN-based authentication)
-- NOTE: We're NOT using Supabase Auth (auth.users) - this is custom PIN-based auth
-- Use auth.users ONLY if you want email/password authentication
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  dob_month INTEGER,
  dob_year INTEGER,
  pin TEXT NOT NULL, -- Hashed PIN (SHA-256)
  secret_answer TEXT NOT NULL, -- Hashed secret answer (mom's birth year) for PIN reset
  membership TEXT DEFAULT 'free' CHECK (membership IN ('free', 'monthly', 'yearly', 'paid')),
  -- Stripe fields
  stripe_customer_id TEXT,
  stripe_price_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for Stripe customer lookup
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);

-- Sessions table (OPTIONAL - only if you want server-side session tracking)
-- If using localStorage for sessions, you can skip this table
-- Uncomment below if you want server-side session management:
-- CREATE TABLE IF NOT EXISTS public.user_sessions (
--   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
--   user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
--   email TEXT NOT NULL,
--   expires_at TIMESTAMPTZ NOT NULL,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- Course enrollments
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Course progress
CREATE TABLE IF NOT EXISTS public.course_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  completed_sections INTEGER[] DEFAULT '{}',
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

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
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
-- Uncomment if using user_sessions table:
-- CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.user_sessions(user_id);
-- CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON public.user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON public.course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_course_id ON public.course_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_user_id ON public.quiz_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_course_id ON public.quiz_scores(course_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_progress_updated_at BEFORE UPDATE ON public.course_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- Uncomment if using user_sessions table:
-- ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Custom PIN-based Auth
-- Since we're not using Supabase Auth, we use service role key for all operations
-- RLS is disabled - all access is controlled via API routes with session validation

-- For custom auth, we'll handle security in API routes, not RLS
-- But we can still enable RLS and use service role for operations

-- Profiles: Allow service role to manage all (security handled in API)
CREATE POLICY "Service role can manage profiles" ON public.profiles
  FOR ALL USING (true);

-- Sessions: Uncomment if using user_sessions table
-- CREATE POLICY "Service role can manage sessions" ON public.user_sessions
--   FOR ALL USING (true);

-- Enrollments: Allow service role to manage all
CREATE POLICY "Service role can manage enrollments" ON public.course_enrollments
  FOR ALL USING (true);

-- Progress: Allow service role to manage all
CREATE POLICY "Service role can manage progress" ON public.course_progress
  FOR ALL USING (true);

-- Quiz Scores: Allow service role to manage all
CREATE POLICY "Service role can manage quiz_scores" ON public.quiz_scores
  FOR ALL USING (true);

