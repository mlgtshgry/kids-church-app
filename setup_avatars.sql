-- Copy and Run this in your Supabase SQL Editor

-- 1. Add `avatar_url` column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'avatar_url') THEN
        ALTER TABLE students ADD COLUMN avatar_url text;
    END IF;
END $$;

-- 2. Create 'avatars' storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Enable public access to view images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'avatars' );

-- 4. Enable public upload (simplified for this app - allows anyone to upload)
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'avatars' );
