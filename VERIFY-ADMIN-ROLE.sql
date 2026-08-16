-- ============================================
-- VERIFY & FIX ADMIN ROLE
-- ============================================

-- Step 1: Check current admin user
SELECT 
  user_id,
  email,
  full_name,
  role,
  created_at
FROM profiles 
WHERE email = 'admin@gmail.com';

-- Expected result:
-- email: admin@gmail.com
-- role: admin (MUST BE 'admin', not 'user')

-- ============================================
-- If role is NOT 'admin', run this:
-- ============================================

UPDATE profiles 
SET role = 'admin'
WHERE email = 'admin@gmail.com';

-- ============================================
-- Verify again
-- ============================================

SELECT 
  user_id,
  email,
  full_name,
  role
FROM profiles 
WHERE email = 'admin@gmail.com';

-- Should now show: role = 'admin' ✅

-- ============================================
-- Check all users and their roles
-- ============================================

SELECT 
  email,
  full_name,
  role,
  created_at
FROM profiles 
ORDER BY created_at DESC;

-- ============================================
-- DONE! Now logout and login again
-- ============================================
