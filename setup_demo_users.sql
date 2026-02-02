-- Insert Demo Users for Testing
-- Run this in your Supabase SQL Editor

-- 1. Create Kids Admin (if not exists)
insert into app_users (username, pin, role, full_name)
values 
  ('kids_admin', '1234', 'ADMIN', 'Kids Administrator')
on conflict (username) do nothing;

-- 2. Create Usher Admin (if not exists)
insert into app_users (username, pin, role, full_name)
values 
  ('usher_admin', '1234', 'USHER_ADMIN', 'Head Usher')
on conflict (username) do nothing;
