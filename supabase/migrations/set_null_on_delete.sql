-- Bulletproof script to safely change CASCADE to SET NULL
-- This prevents the "Database Error" caused by trigger deadlocks during deletion

DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (
    SELECT tc.constraint_name, tc.table_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name IN ('forum_posts', 'forum_comments', 'jl_entries', 'votes', 'reports')
      AND kcu.column_name IN ('author_id', 'user_id', 'reporter_id')
  ) LOOP
    EXECUTE 'ALTER TABLE ' || quote_ident(r.table_name) || ' DROP CONSTRAINT ' || quote_ident(r.constraint_name);
  END LOOP;
END $$;

ALTER TABLE forum_posts ALTER COLUMN author_id DROP NOT NULL;
ALTER TABLE forum_posts ADD FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE forum_comments ALTER COLUMN author_id DROP NOT NULL;
ALTER TABLE forum_comments ADD FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE jl_entries ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE jl_entries ADD FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE votes ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE votes ADD FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE reports ALTER COLUMN reporter_id DROP NOT NULL;
ALTER TABLE reports ADD FOREIGN KEY (reporter_id) REFERENCES profiles(id) ON DELETE SET NULL;
