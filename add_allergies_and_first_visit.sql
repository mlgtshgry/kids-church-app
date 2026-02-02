-- Add Allergies and First Visit Date to students table

alter table students 
add column if not exists allergies text,
add column if not exists first_visit_date date default CURRENT_DATE;

-- Optional: Update existing records to have a first_visit_date if null (using created_at or just today)
update students 
set first_visit_date = created_at::date 
where first_visit_date is null;