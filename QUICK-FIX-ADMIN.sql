-- ============================================
-- QUICK FIX: Add Admin UID
-- ============================================

-- STEP 1: Find all users
SELECT 
  id as user_uid,
  email,
  created_at,
  '👆 Find your admin email and copy the UID' as instruction
FROM auth.users
ORDER BY created_at DESC;

-- ============================================
-- STEP 2: Insert Admin UID Manually
-- ============================================
-- Replace 'YOUR_ADMIN_UID' with the actual UID from step 1
-- Find the row with your admin email, copy the UID, paste below

-- EXAMPLE: If your admin UID is cb26928a-6e50-4a5c-ad1d-c5c76caa98ad
-- Then uncomment and run this:

INSERT INTO admin_users (user_id) 
VALUES ('cb26928a-6e50-4a5c-ad1d-c5c76caa98ad')
ON CONFLICT (user_id) DO NOTHING;

-- ⬆️ EDIT THE UID ABOVE WITH YOUR ACTUAL ADMIN UID! ⬆️

-- ============================================
-- STEP 3: Verify Admin Setup
-- ============================================

-- Check admin_users table
SELECT 
  au.user_id,
  u.email as admin_email,
  au.created_at,
  '✅ Admin found!' as status
FROM admin_users au
LEFT JOIN auth.users u ON au.user_id = u.id;

-- ============================================
-- EXPECTED RESULT:
-- ============================================
-- You should see:
-- | user_id                              | admin_email           | created_at | status        |
-- |--------------------------------------|-----------------------|------------|---------------|
-- | cb26928a-6e50-4a5c-ad1d-c5c76caa98ad | admin@example.com     | 2025-...   | ✅ Admin found!|

-- If the table is empty or email is NULL, the UID is wrong or user doesn't exist!
