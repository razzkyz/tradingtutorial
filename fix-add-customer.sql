-- ============================================
-- FIX ADD CUSTOMER FEATURE
-- Drop auto-trigger and allow admin to insert profiles
-- ============================================

-- Drop the trigger that auto-creates profile
-- This trigger causes RLS policy violation when admin uses admin.createUser()
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Verify trigger is dropped
SELECT 
  trigger_name, 
  event_object_table, 
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public' 
  AND event_object_table = 'users';

-- NOTE: Admin will manually create profile in AddCustomer.tsx
-- This is controlled by RLS policy "profiles_admin_all" which allows admin to INSERT

-- Verify admin can insert profiles
-- Test query (replace with real admin UID):
-- INSERT INTO profiles (user_id, full_name, email, role)
-- VALUES ('test-uuid', 'Test User', 'test@example.com', 'user')
-- RETURNING *;

SELECT 'Trigger dropped! Admin can now add customers.' as status;
