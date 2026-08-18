-- ============================================
-- STEP 3: ADD YOUR ADMIN UID (Run AFTER step 2!)
-- ============================================

-- Find your admin user ID
SELECT 
  id as admin_uid,
  email,
  created_at,
  '👆 Copy the admin_uid above' as instruction
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- MANUAL STEP: INSERT YOUR ADMIN UID
-- ============================================
-- After finding your admin UID above, uncomment and run this:
-- (Replace 'YOUR_ADMIN_UID_HERE' with actual UID)

-- INSERT INTO admin_users (user_id) 
-- VALUES ('YOUR_ADMIN_UID_HERE')
-- ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- VERIFY ADMIN SETUP
-- ============================================

-- Check admin_users table
SELECT 
  au.user_id,
  u.email,
  au.created_at,
  '✅ Admin found!' as status
FROM admin_users au
JOIN auth.users u ON au.user_id = u.id;

-- Test is_admin() function
SELECT 
  is_admin() as am_i_admin,
  auth.uid() as my_user_id,
  CASE 
    WHEN is_admin() THEN '✅ You are admin!'
    ELSE '❌ You are NOT admin. Make sure to insert your UID in admin_users table.'
  END as result;
