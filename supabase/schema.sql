-- ============================================
-- TCS JL Tracker — Supabase Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to ensure a clean run
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS forum_comments CASCADE;
DROP TABLE IF EXISTS forum_posts CASCADE;
DROP TABLE IF EXISTS forum_categories CASCADE;
DROP TABLE IF EXISTS jl_entries CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing trigger to prevent recreation error
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ============================================
-- 1. PROFILES
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  stream TEXT CHECK (stream IN ('Digital', 'Ninja', 'Prime')),
  preferred_location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    COALESCE(NEW.raw_user_meta_data->>'preferred_username', 'user_' || LEFT(NEW.id::TEXT, 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 2. JL ENTRIES
-- ============================================
CREATE TABLE jl_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Dates
  interview_date DATE,
  ol_date DATE,
  jl_date DATE,
  onboarding_date DATE,
  
  -- Details
  interview_domain TEXT,
  stream TEXT CHECK (stream IN ('Digital', 'Ninja', 'Prime')),
  campus_type TEXT CHECK (campus_type IN ('On-campus', 'Off-campus', 'TCS NQT', 'CodeVita')),
  xplore_points INTEGER DEFAULT 0,
  ipa_status TEXT CHECK (ipa_status IN ('Given', 'Not Given')) DEFAULT 'Not Given',
  ipa_score NUMERIC,
  
  -- Locations
  pref_loc_1 TEXT,
  pref_loc_2 TEXT,
  pref_loc_3 TEXT,
  ilp_location TEXT,
  work_location TEXT,
  
  -- Extras
  additional_notes TEXT,
  upvotes INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for jl_entries
ALTER TABLE jl_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "JL entries are viewable by everyone"
  ON jl_entries FOR SELECT USING (is_deleted = FALSE);

CREATE POLICY "Authenticated users can insert JL entries"
  ON jl_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own JL entries"
  ON jl_entries FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own JL entries"
  ON jl_entries FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jl_entries_updated_at
  BEFORE UPDATE ON jl_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 3. FORUM CATEGORIES
-- ============================================
CREATE TABLE forum_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON forum_categories FOR SELECT USING (true);

-- Seed default categories
INSERT INTO forum_categories (name, slug, description, icon, color, sort_order) VALUES
  ('JL Updates', 'jl-updates', 'Share and discuss Joining Letter news and updates', 'Rocket', '#7c3aed', 1),
  ('IPA Discussion', 'ipa-discussion', 'IPA status, tips, and experiences', 'Briefcase', '#8b5cf6', 2),
  ('Location Talk', 'location-talk', 'City-specific discussions for Hyderabad, Pune, Kolkata and more', 'MapPin', '#a78bfa', 3),
  ('Interview Experience', 'interview-experience', 'Share your interview journey and preparation tips', 'GraduationCap', '#6d28d9', 4),
  ('Xplore & Learning', 'xplore-learning', 'Xplore points, courses, certifications and tips', 'BookOpen', '#5b21b6', 5),
  ('General Q&A', 'general-qa', 'Ask anything TCS-related', 'HelpCircle', '#4c1d95', 6);

-- ============================================
-- 4. FORUM POSTS
-- ============================================
CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES forum_categories(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  location_tag TEXT,
  upvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are viewable by everyone"
  ON forum_posts FOR SELECT USING (is_deleted = FALSE);

CREATE POLICY "Authenticated users can create posts"
  ON forum_posts FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts"
  ON forum_posts FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts"
  ON forum_posts FOR DELETE USING (auth.uid() = author_id);

CREATE TRIGGER forum_posts_updated_at
  BEFORE UPDATE ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 5. FORUM COMMENTS
-- ============================================
CREATE TABLE forum_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone"
  ON forum_comments FOR SELECT USING (is_deleted = FALSE);

CREATE POLICY "Authenticated users can create comments"
  ON forum_comments FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own comments"
  ON forum_comments FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments"
  ON forum_comments FOR DELETE USING (auth.uid() = author_id);

-- Update comment count on post
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_change
  AFTER INSERT OR DELETE ON forum_comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- ============================================
-- 6. VOTES
-- ============================================
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  votable_type TEXT CHECK (votable_type IN ('jl_entry', 'post', 'comment')) NOT NULL,
  votable_id UUID NOT NULL,
  value INTEGER CHECK (value IN (1, -1)) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, votable_type, votable_id)
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Votes are viewable by everyone"
  ON votes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote"
  ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes"
  ON votes FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
  ON votes FOR DELETE USING (auth.uid() = user_id);

-- Function to update upvote counts
CREATE OR REPLACE FUNCTION update_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.votable_type = 'post' THEN
      UPDATE forum_posts SET upvotes = upvotes + NEW.value WHERE id = NEW.votable_id;
    ELSIF NEW.votable_type = 'comment' THEN
      UPDATE forum_comments SET upvotes = upvotes + NEW.value WHERE id = NEW.votable_id;
    ELSIF NEW.votable_type = 'jl_entry' THEN
      UPDATE jl_entries SET upvotes = upvotes + NEW.value WHERE id = NEW.votable_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.votable_type = 'post' THEN
      UPDATE forum_posts SET upvotes = upvotes + NEW.value - OLD.value WHERE id = NEW.votable_id;
    ELSIF NEW.votable_type = 'comment' THEN
      UPDATE forum_comments SET upvotes = upvotes + NEW.value - OLD.value WHERE id = NEW.votable_id;
    ELSIF NEW.votable_type = 'jl_entry' THEN
      UPDATE jl_entries SET upvotes = upvotes + NEW.value - OLD.value WHERE id = NEW.votable_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.votable_type = 'post' THEN
      UPDATE forum_posts SET upvotes = upvotes - OLD.value WHERE id = OLD.votable_id;
    ELSIF OLD.votable_type = 'comment' THEN
      UPDATE forum_comments SET upvotes = upvotes - OLD.value WHERE id = OLD.votable_id;
    ELSIF OLD.votable_type = 'jl_entry' THEN
      UPDATE jl_entries SET upvotes = upvotes - OLD.value WHERE id = OLD.votable_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_vote_count();

-- ============================================
-- 7. REPORTS
-- ============================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reportable_type TEXT CHECK (reportable_type IN ('post', 'comment')) NOT NULL,
  reportable_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'reviewed', 'resolved')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT USING (auth.uid() = reporter_id);

-- ============================================
-- 8. INDEXES
-- ============================================
CREATE INDEX idx_jl_entries_user_id ON jl_entries(user_id);
CREATE INDEX idx_jl_entries_stream ON jl_entries(stream);
CREATE INDEX idx_jl_entries_work_location ON jl_entries(work_location);
CREATE INDEX idx_jl_entries_jl_date ON jl_entries(jl_date DESC);
CREATE INDEX idx_jl_entries_onboarding_date ON jl_entries(onboarding_date DESC);
CREATE INDEX idx_jl_entries_created_at ON jl_entries(created_at DESC);

CREATE INDEX idx_forum_posts_category_id ON forum_posts(category_id);
CREATE INDEX idx_forum_posts_author_id ON forum_posts(author_id);
CREATE INDEX idx_forum_posts_created_at ON forum_posts(created_at DESC);

CREATE INDEX idx_forum_comments_post_id ON forum_comments(post_id);
CREATE INDEX idx_forum_comments_parent_id ON forum_comments(parent_comment_id);

CREATE INDEX idx_votes_votable ON votes(votable_type, votable_id);
CREATE INDEX idx_votes_user ON votes(user_id);

CREATE INDEX idx_reports_status ON reports(status);

-- ============================================
-- 9. VIEWS for Dashboard Stats
-- ============================================
CREATE OR REPLACE VIEW jl_stats AS
SELECT
  COUNT(*) AS total_entries,
  COUNT(DISTINCT work_location) AS total_locations,
  ROUND(AVG(
    CASE WHEN jl_date IS NOT NULL AND ol_date IS NOT NULL
    THEN EXTRACT(DAYS FROM (jl_date::timestamp - ol_date::timestamp))
    END
  )) AS avg_wait_days
FROM jl_entries
WHERE is_deleted = FALSE;

CREATE OR REPLACE VIEW jl_by_location AS
SELECT
  COALESCE(work_location, 'Unknown') AS location,
  COUNT(*) AS count
FROM jl_entries
WHERE is_deleted = FALSE
GROUP BY work_location
ORDER BY count DESC;

CREATE OR REPLACE VIEW jl_by_stream AS
SELECT
  COALESCE(stream, 'Unknown') AS stream,
  COUNT(*) AS count
FROM jl_entries
WHERE is_deleted = FALSE
GROUP BY stream
ORDER BY count DESC;

CREATE OR REPLACE VIEW jl_monthly_trend AS
SELECT
  TO_CHAR(jl_date, 'YYYY-MM') AS month,
  COUNT(*) AS total
FROM jl_entries
WHERE is_deleted = FALSE AND jl_date IS NOT NULL
GROUP BY TO_CHAR(jl_date, 'YYYY-MM')
ORDER BY month;

-- ============================================
-- 10. BACKFILL PROFILES
-- ============================================
-- If you drop the public schema, existing auth users lose their profiles.
-- This script safely re-creates them so foreign key constraints don't fail.
INSERT INTO public.profiles (id, username, full_name, avatar_url)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'preferred_username', 'user_' || LEFT(id::TEXT, 8)), 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', ''), 
  COALESCE(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture', '')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
