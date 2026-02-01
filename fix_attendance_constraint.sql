-- Fix for "no unique or exclusion constraints matching the ON CONFLICT specification"

-- This ensures a student cannot be marked present twice on the same day.
-- It allows the app to "update" the record if scanned again, instead of crashing.

ALTER TABLE attendance
ADD CONSTRAINT attendance_student_date_key UNIQUE (student_id, date);
