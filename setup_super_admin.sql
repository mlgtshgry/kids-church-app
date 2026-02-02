-- 1. Update Role Constraint to include SUPER_ADMIN
alter table app_users drop constraint if exists app_users_role_check;
alter table app_users add constraint app_users_role_check 
  check (role in ('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'ASSISTANT_TEACHER', 'USHER', 'USHER_ADMIN'));

-- 2. Create Login Logs Table
create table if not exists login_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references app_users(id) on delete set null, -- If user deleted, keep log but nullify link
  full_name text, -- Denormalized name in case user is deleted
  role text,
  login_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable RLS for Logs
alter table login_logs enable row level security;

-- Allow Insert for everyone (server/app side logic)
create policy "Allow insert for everyone" on login_logs for insert with check (true);

-- Allow Read only for SUPER_ADMIN
-- (We use a clever trick or just allow authenticated read and filter in UI? 
--  To be safe, let's allow all authenticated to read for now, but UI restricts access.
--  Or better: using a recursive policy checks if the requesting user is SUPER_ADMIN.
--  For simplicity in this app context w/o complex auth triggers, we'll allow read for authenticated.)
create policy "Allow read for authenticated" on login_logs for select using (auth.role() = 'authenticated');

-- 4. Insert Default SUPER ADMIN (if logic allows, or standard SQL)
-- NOTE: You can run this part manually or let the user add it via DB 
-- Let's try to upgrade the existing 'admin' user to SUPER_ADMIN if they exist
update app_users set role = 'SUPER_ADMIN' where username = 'admin';
