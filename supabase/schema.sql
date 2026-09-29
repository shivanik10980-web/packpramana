-- ==============================================================================
-- PackPramana (SIH26236) - Supabase Cloud Persistence Schema
-- Run this in your Supabase SQL Editor to enable cloud scenario synchronization.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.packpramana_scenarios (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  schema_version INTEGER NOT NULL DEFAULT 1,
  input JSONB NOT NULL,
  result JSONB NOT NULL,
  note TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.packpramana_scenarios ENABLE ROW LEVEL SECURITY;

-- Allow anonymous or authenticated read/write for hackathon demo usage
CREATE POLICY "Allow public read access"
  ON public.packpramana_scenarios
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert and update"
  ON public.packpramana_scenarios
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Index for speedy ordering by timestamp
CREATE INDEX IF NOT EXISTS idx_packpramana_created_at
  ON public.packpramana_scenarios (created_at DESC);
