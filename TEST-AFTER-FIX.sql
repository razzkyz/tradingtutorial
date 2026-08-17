-- ============================================
-- TEST QUERIES AFTER RUNNING RESET-AND-FIX-ALL.sql
-- Copy dan paste satu-persatu untuk verify
-- ============================================

-- TEST 1: Check admin_users table
-- Expected: Should return admin UID
SELECT 
  user_id,
  created_at,
  'Admin user found!' as status
FROM admin_users;

-- TEST 2: Check is_admin() function
-- Expected: true if logged in as admin, false if logged in as user
SELECT 
  is_admin() as am_i_admin,
  auth.uid() as my_user_id;

-- TEST 3: Check all RLS policies exist
-- Expected: Should show policies for profiles, balances, trading_access, etc
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN policyname LIKE '%admin%' THEN '🔑 ADMIN'
    WHEN policyname LIKE '%own%' THEN '👤 USER'
    ELSE '📋 OTHER'
  END as policy_type
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'balances', 'trading_access', 'withdrawals', 'trades')
ORDER BY tablename, policyname;

-- TEST 4: Check profiles table (should work for admin)
-- Expected: All profiles visible to admin
SELECT 
  user_id,
  full_name,
  email,
  role,
  investment_amount,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- TEST 5: Check balances (should work for admin)
-- Expected: All balances visible to admin
SELECT 
  b.user_id,
  p.full_name,
  b.balance_type,
  b.currency,
  b.amount
FROM balances b
JOIN profiles p ON b.user_id = p.user_id
ORDER BY p.full_name, b.balance_type;

-- TEST 6: Check trading_access (should work for admin)
-- Expected: All trading access records visible to admin
SELECT 
  ta.user_id,
  p.full_name,
  ta.status,
  ta.created_at
FROM trading_access ta
JOIN profiles p ON ta.user_id = p.user_id
ORDER BY p.full_name;

-- TEST 7: Count statistics
-- Expected: Numbers matching your actual data
SELECT 
  (SELECT COUNT(*) FROM profiles WHERE role = 'user') as total_customers,
  (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as total_admins,
  (SELECT COUNT(*) FROM trading_access WHERE status = 'active') as active_trading,
  (SELECT COALESCE(SUM(amount), 0) FROM balances) as total_balance_all_users;

-- TEST 8: Verify no triggers on auth.users
-- Expected: Empty result (no triggers)
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public' 
  AND event_object_table = 'users';

-- TEST 9: Try INSERT as admin (simulate Add Customer)
-- Expected: Success if you are admin, error if you are not admin
-- NOTE: This is a DRY RUN - will rollback automatically
BEGIN;
  -- Try to insert a test profile (will rollback, so no actual data change)
  INSERT INTO profiles (user_id, full_name, email, role)
  VALUES (
    gen_random_uuid(), 
    'Test Customer', 
    'test_' || floor(random() * 1000) || '@example.com',
    'user'
  )
  RETURNING user_id, full_name, email, 'TEST INSERT SUCCESS!' as status;
ROLLBACK; -- Undo the test insert

-- TEST 10: Check admin email matches UID
-- Expected: Should show your admin email and UID
SELECT 
  au.user_id as admin_uid,
  u.email as admin_email,
  p.full_name as admin_name,
  'Admin verified!' as status
FROM admin_users au
JOIN auth.users u ON au.user_id = u.id
LEFT JOIN profiles p ON au.user_id = p.user_id;

-- ============================================
-- FINAL VERIFICATION MESSAGE
-- ============================================
SELECT 
  '✅ ALL TESTS COMPLETE!' as message,
  'If all queries above returned data without errors, your RLS policies are working!' as status;

