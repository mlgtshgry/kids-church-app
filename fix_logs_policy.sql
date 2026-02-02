-- Fix RLS Policy for Login Logs
-- Since we are using an Anon Key with custom PIN auth (no real Supabase Auth session), 
-- 'auth.role()' remains 'anon', causing the previous 'authenticated' policy to verify false.

-- Drop the restrictive policy
drop policy if exists "Allow read for authenticated" on login_logs;

-- Allow public read (application layer handles permission checks)
create policy "Allow public read for logs" on login_logs for select using (true);
