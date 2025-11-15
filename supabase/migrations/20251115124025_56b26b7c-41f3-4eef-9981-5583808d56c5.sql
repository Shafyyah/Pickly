-- Create tables for decision history and memory

-- 1. Chat history table
CREATE TABLE public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  feature_category TEXT NOT NULL CHECK (feature_category IN ('dinner', 'activity', 'universal_search')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Image analysis history
CREATE TABLE public.image_analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  detected_ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  corrected_ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Suggestion history
CREATE TABLE public.suggestion_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  suggestion_text TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('dinner', 'activity')),
  action_taken TEXT CHECK (action_taken IN ('do_it', 'suggest_again', 'pick_for_me')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  full_details JSONB DEFAULT '{}'::jsonb
);

-- 4. User preferences (learned patterns)
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestion_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_history
CREATE POLICY "Users can view their own chat history"
  ON public.chat_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat history"
  ON public.chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for image_analysis_history
CREATE POLICY "Users can view their own image analysis"
  ON public.image_analysis_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own image analysis"
  ON public.image_analysis_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for suggestion_history
CREATE POLICY "Users can view their own suggestions"
  ON public.suggestion_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own suggestions"
  ON public.suggestion_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suggestions"
  ON public.suggestion_history FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Create storage bucket for fridge photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('fridge-photos', 'fridge-photos', false)
ON CONFLICT DO NOTHING;

-- Storage policies for fridge photos
CREATE POLICY "Users can upload their own photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'fridge-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'fridge-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'fridge-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );