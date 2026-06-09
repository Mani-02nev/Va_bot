-- ============================================================
-- View Once | Mr K AI Eco System — Supabase Schema
-- ============================================================
-- Run this in your Supabase SQL Editor to set up the database.

-- ============================================================
-- Table: projects
-- Stores user projects including metadata, data, and chat history
-- ============================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL DEFAULT 'My Project',
  type          TEXT        NOT NULL DEFAULT 'Custom / Other',
  file_name     TEXT        NOT NULL DEFAULT '',
  row_count     INTEGER     NOT NULL DEFAULT 0,
  col_count     INTEGER     NOT NULL DEFAULT 0,
  data_rows     JSONB       DEFAULT '[]'::JSONB,
  cleaned_rows  JSONB       DEFAULT '[]'::JSONB,
  messages      JSONB       DEFAULT '[]'::JSONB,
  pipeline_mode TEXT        NOT NULL DEFAULT 'auto',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for faster user queries
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON public.projects (user_id);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON public.projects (created_at DESC);

-- ============================================================
-- Auto-update updated_at on row change
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Users can only SELECT their own projects
CREATE POLICY "users_select_own_projects"
  ON public.projects
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only INSERT projects for themselves
CREATE POLICY "users_insert_own_projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only UPDATE their own projects
CREATE POLICY "users_update_own_projects"
  ON public.projects
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only DELETE their own projects
CREATE POLICY "users_delete_own_projects"
  ON public.projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- Storage Bucket (optional — for large CSV files)
-- ============================================================
-- Enable Storage in Supabase dashboard, then create a bucket
-- named 'datasets' with the following policy (run in SQL editor):
--
-- INSERT INTO storage.buckets (id, name, public) VALUES ('datasets', 'datasets', false);
--
-- CREATE POLICY "users_own_datasets"
--   ON storage.objects
--   FOR ALL
--   USING (bucket_id = 'datasets' AND auth.uid()::text = (storage.foldername(name))[1])
--   WITH CHECK (bucket_id = 'datasets' AND auth.uid()::text = (storage.foldername(name))[1]);
