-- Allow full access to app_users for now (since we use client-side auth logic)
-- Note: In a production app with real backend, this would remain restricted.
drop policy if exists "Allow public read for login" on app_users;
create policy "Enable full access for app_users" on app_users for all using (true);
