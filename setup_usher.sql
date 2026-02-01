-- 1. Create table for Adult/Congregation Members
create table if not exists members (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text not null,
  contact_number text,
  address text,
  birthday date,
  notes text,
  age_group text default 'ADULT' -- YOUTH | ADULT | SENIOR
);

-- 2. Create table for Service Attendance
create table if not exists member_attendance (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  member_id uuid references members(id) on delete cascade not null,
  date date not null default CURRENT_DATE,
  service_type text default 'MORNING_SERVICE', -- MORNING_SERVICE | EVENING_SERVICE | SPECIAL_EVENT
  status text default 'PRESENT',
  unique(member_id, date, service_type)
);

-- 3. Enable RLS (Security) but allow public access for now (client-side logic)
alter table members enable row level security;
alter table member_attendance enable row level security;

create policy "Allow full access to members" on members for all using (true);
create policy "Allow full access to member_attendance" on member_attendance for all using (true);

-- 4. Initial Usher Admin (Optional - User can create via UserManager if they are already Admin)
-- But let's verify roles are clear. We don't need to change the schema for app_users, 
-- just the 'role' column values will now include 'USHER' and 'USHER_ADMIN'.
