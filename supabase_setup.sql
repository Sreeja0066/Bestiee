-- =====================================================
-- BESTIEE — Supabase Database Setup
-- Run this in: supabase.com → SQL Editor → New Query
-- =====================================================

-- 1. User Profiles (linked to Supabase Auth)
CREATE TABLE profiles (
  id               UUID REFERENCES auth.users PRIMARY KEY,
  display_name     TEXT,
  consent_training BOOLEAN DEFAULT FALSE,
  consent_given_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Chat Sessions
CREATE TABLE sessions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users NOT NULL,
  title         TEXT DEFAULT 'New Chat',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  message_count INTEGER DEFAULT 0
);

-- 3. Messages (stores every chat message)
CREATE TABLE messages (
  id          BIGSERIAL PRIMARY KEY,
  session_id  UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users NOT NULL,
  role        TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content     TEXT NOT NULL,
  emotion     TEXT,
  ai_mode     TEXT CHECK (ai_mode IN ('groq', 'local')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Settings (API key, theme preference)
CREATE TABLE user_settings (
  user_id      UUID REFERENCES auth.users PRIMARY KEY,
  groq_api_key TEXT,
  theme        TEXT DEFAULT 'light',
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY — Each user sees ONLY their data
-- This prevents any data breach between users
-- =====================================================

ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_profile"   ON profiles      FOR ALL USING (auth.uid() = id);
CREATE POLICY "own_sessions"  ON sessions      FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_messages"  ON messages      FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_settings"  ON user_settings FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- DONE! Your database is ready.
-- =====================================================
