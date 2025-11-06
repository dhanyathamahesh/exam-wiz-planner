-- Create curricula table for board/grade/subject structure
CREATE TABLE IF NOT EXISTS public.curricula (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board TEXT NOT NULL, -- CBSE, ICSE, Karnataka, etc.
  grade TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  syllabus_structure JSONB, -- Tree structure of chapters/topics
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create chapters table with detailed metadata
CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  curriculum_id UUID REFERENCES public.curricula(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  description TEXT,
  estimated_time_minutes INTEGER, -- estimated study time
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  keywords TEXT[], -- for search and tagging
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Modify resources table to better link to chapters
ALTER TABLE public.resources 
  DROP COLUMN IF EXISTS subject_id,
  ADD COLUMN IF NOT EXISTS chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS resource_type TEXT CHECK (resource_type IN ('pdf', 'youtube', 'notes', 'audio', 'examples')),
  ADD COLUMN IF NOT EXISTS uploader_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS license_info TEXT;

-- Update resources table type column name for clarity
ALTER TABLE public.resources 
  DROP CONSTRAINT IF EXISTS resources_type_check;

-- Modify user_progress to track chapter-level progress
ALTER TABLE public.user_progress
  DROP COLUMN IF EXISTS resource_id,
  ADD COLUMN IF NOT EXISTS chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS first_accessed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS time_spent_minutes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE public.curricula ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- RLS policies for curricula (public read)
CREATE POLICY "Anyone can view curricula"
  ON public.curricula FOR SELECT
  USING (true);

-- RLS policies for chapters (public read)
CREATE POLICY "Anyone can view chapters"
  ON public.chapters FOR SELECT
  USING (true);

-- Update user_progress RLS to work with new chapter_id
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;

CREATE POLICY "Users can view own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chapters_subject ON public.chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_chapters_curriculum ON public.chapters(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_resources_chapter ON public.resources(chapter_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_chapter ON public.user_progress(chapter_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress(user_id);

-- Trigger for updated_at on curricula
CREATE TRIGGER update_curricula_updated_at
  BEFORE UPDATE ON public.curricula
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on chapters
CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON public.chapters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();