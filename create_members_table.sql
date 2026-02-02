-- Create Members Table for Congregation/Adults
create table if not exists members (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  nickname text,
  gender text not null check (gender in ('Male', 'Female')),
  birthday date,
  contact_number text,
  address text,
  civil_status text, 
  ministry text,
  allergies text,
  first_visit_date date default CURRENT_DATE,
  avatar_url text, -- optional for photo
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security) - Optional but good practice, though we might keep it disabled for this simple app
alter table members enable row level security;

-- Create policy to allow public access (since we are likely using Anon key for now as per previous context)
create policy "Allow public access to members" on members for all using (true);

-- Ensure we can query it easily
comment on table members is 'Adult congregation members list';
