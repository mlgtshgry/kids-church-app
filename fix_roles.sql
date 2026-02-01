-- The error happens because the database STRICTLY enforces roles.
-- We need to tell the database that 'USHER' and 'USHER_ADMIN' are allowed.

-- 1. Remove the old strict rule
alter table app_users drop constraint if exists app_users_role_check;

-- 2. Add the NEW rule that includes USHER roles
alter table app_users add constraint app_users_role_check 
  check (role in ('ADMIN', 'TEACHER', 'ASSISTANT_TEACHER', 'USHER', 'USHER_ADMIN'));

-- 3. (Optional) Fix any users that might have been stuck (none likely)
