-- Fix cascading deletes so we can delete users while preserving their posts as "Deleted User"

-- For forum_posts
ALTER TABLE forum_posts DROP CONSTRAINT IF EXISTS forum_posts_author_id_fkey;
ALTER TABLE forum_posts ALTER COLUMN author_id DROP NOT NULL;
ALTER TABLE forum_posts ADD CONSTRAINT forum_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- For forum_comments
ALTER TABLE forum_comments DROP CONSTRAINT IF EXISTS forum_comments_author_id_fkey;
ALTER TABLE forum_comments ALTER COLUMN author_id DROP NOT NULL;
ALTER TABLE forum_comments ADD CONSTRAINT forum_comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- For jl_entries
ALTER TABLE jl_entries DROP CONSTRAINT IF EXISTS jl_entries_user_id_fkey;
ALTER TABLE jl_entries ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE jl_entries ADD CONSTRAINT jl_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- For votes
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_user_id_fkey;
ALTER TABLE votes ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE votes ADD CONSTRAINT votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- For reports
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_reporter_id_fkey;
ALTER TABLE reports ALTER COLUMN reporter_id DROP NOT NULL;
ALTER TABLE reports ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES profiles(id) ON DELETE SET NULL;
