-- Create a secure function to get quiz questions without exposing answers until completion
CREATE OR REPLACE FUNCTION public.get_quiz_questions_safe(p_quiz_id uuid)
RETURNS TABLE (
  id uuid,
  quiz_id uuid,
  question_text text,
  options jsonb,
  correct_answer text,
  explanation text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user owns the quiz
  IF NOT EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = p_quiz_id 
    AND quizzes.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized access to quiz';
  END IF;

  -- Check if quiz has been completed
  IF EXISTS (
    SELECT 1 FROM quiz_attempts 
    WHERE quiz_attempts.quiz_id = p_quiz_id 
    AND quiz_attempts.user_id = auth.uid()
  ) THEN
    -- Quiz completed, return all data including answers
    RETURN QUERY
    SELECT 
      qq.id,
      qq.quiz_id,
      qq.question_text,
      qq.options,
      qq.correct_answer,
      qq.explanation,
      qq.created_at
    FROM quiz_questions qq
    WHERE qq.quiz_id = p_quiz_id;
  ELSE
    -- Quiz not completed, hide answers
    RETURN QUERY
    SELECT 
      qq.id,
      qq.quiz_id,
      qq.question_text,
      qq.options,
      NULL::text as correct_answer,
      NULL::text as explanation,
      qq.created_at
    FROM quiz_questions qq
    WHERE qq.quiz_id = p_quiz_id;
  END IF;
END;
$$;

-- Add missing RLS policies for quiz_questions
CREATE POLICY "Users can insert questions for own quizzes"
  ON quiz_questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
      AND quizzes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update questions for own quizzes"
  ON quiz_questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
      AND quizzes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete questions for own quizzes"
  ON quiz_questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
      AND quizzes.user_id = auth.uid()
    )
  );

-- Add missing RLS policies for study_plan_items
CREATE POLICY "Users can insert own study plan items"
  ON study_plan_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM study_plans
      WHERE study_plans.id = study_plan_items.study_plan_id
      AND study_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own study plan items"
  ON study_plan_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM study_plans
      WHERE study_plans.id = study_plan_items.study_plan_id
      AND study_plans.user_id = auth.uid()
    )
  );