-- Create the device_logs table to track unique devices via Virtual ID
create table if not exists device_logs (
  id uuid default gen_random_uuid() primary key,
  device_id text not null,
  last_seen timestamp with time zone default timezone('utc'::text, now()) not null,
  user_agent text,
  metadata jsonb,
  
  -- Add a constraint to ensure we can upsert easily (optional, but good for performance if we want 1 row per device)
  -- For now, we'll just log every session as a new row or maintain a "Devices" list. 
  -- Let's make it a log stream (new row per session)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Optional: Enable Row Level Security (RLS) if you want to restrict access
alter table device_logs enable row level security;

-- Allow anyone (anon) to insert logs (since we are logging from the public app)
create policy "Enable insert for everyone" on device_logs for insert with check (true);

-- Allow authenticated (teachers) to view logs
create policy "Enable read for authenticated users only" on device_logs for select using (auth.role() = 'authenticated');
