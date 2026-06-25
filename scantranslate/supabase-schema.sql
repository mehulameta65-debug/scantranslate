-- Run this in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → paste this → Run

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  plan TEXT DEFAULT 'free',
  pages_used INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pages table
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT,
  translated_text TEXT,
  target_language TEXT DEFAULT 'English',
  subject_tag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  format TEXT, -- 'pdf' or 'ppt'
  download_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users see own pages" ON pages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own docs" ON documents FOR ALL USING (auth.uid() = user_id);
