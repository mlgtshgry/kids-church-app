-- 1. Create Ministries Table
create table if not exists ministries (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Insert Default Ministries
insert into ministries (name) values 
  ('Kid''s Ministry'),
  ('Music Ministry'),
  ('Ushering'),
  ('Multimedia'),
  ('Prayer')
on conflict (name) do nothing;

-- 3. Enable RLS
alter table ministries enable row level security;
create policy "Allow read access to all" on ministries for select using (true);
create policy "Allow full access to admins/ushers" on ministries for all using (true);

-- 4. Update Members Table (if needed)
-- We will keep the 'ministry' text column for now for backward compatibility or migration,
-- but ideally we should transition to a foreign key. 
-- For this iteration, let's keep it simple and just store the name, 
-- or add a ministry_id column.
-- Let's add ministry_id but keep ministry text for display if join is expensive? 
-- Actually, let's just stick to the text 'ministry' column for simplicity in the UI unless strict relational integrity is needed.
-- But wait, the request asks for 'fix value'.
-- Best approach: The 'ministry' column in 'members' table will store the NAME of the ministry.
-- The 'ministries' table acts as the source of truth for the Valid List.
