-- ============================================
-- COMPLETE RESET AND FIX - TRADING TUTORIALS
-- Run this ONCE to fix all RLS policy issues
-- ============================================

-- STEP 1: Drop ALL existing RLS policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
DROP POLICY IF EXISTS "profiles_view" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_delete" ON profiles;

DROP POLICY IF EXISTS "Users can view own balances" ON balances;
DROP POLICY IF EXISTS "Users can update own balances" ON balances;
DROP POLICY IF EXISTS "Admins can view all balances" ON balances;
DROP POLICY IF EXISTS "Admins can insert balances" ON balances;
DROP POLICY IF EXISTS "Admins can update all balances" ON balances;
DROP POLICY IF EXISTS "balances_select_own" ON balances;
DROP POLICY IF EXISTS "balances_update_own" ON balances;
DROP POLICY IF EXISTS "balances_insert_own" ON balances;
DROP POLICY IF EXISTS "balances_admin_all" ON balances;
DROP POLICY IF EXISTS "balances_view" ON balances;
DROP POLICY IF EXISTS "balances_insert" ON balances;
DROP POLICY IF EXISTS "balances_admin_update" ON balances;
DROP POLICY IF EXISTS "balances_admin_delete" ON balances;

DROP POLICY IF EXISTS "Users can view own trading access" ON trading_access;
DROP POLICY IF EXISTS "Admins can view all trading access" ON trading_access;
DROP POLICY IF EXISTS "Admins can insert trading access" ON trading_access;
DROP POLICY IF EXISTS "Admins can update trading access" ON trading_access;
DROP POLICY IF EXISTS "trading_access_select_own" ON trading_access;
DROP POLICY IF EXISTS "trading_access_insert_own" ON trading_access;
DROP POLICY IF EXISTS "trading_access_update_own" ON trading_access;
DROP POLICY IF EXISTS "trading_access_admin_all" ON trading_access;
DROP POLICY IF EXISTS "trading_access_view" ON trading_access;
DROP POLICY IF EXISTS "trading_access_insert" ON trading_access;
DROP POLICY IF EXISTS "trading_access_admin_update" ON trading_access;
DROP POLICY IF EXISTS "trading_access_admin_delete" ON trading_access;

DROP POLICY IF EXISTS "Users can view own withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Users can insert own withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Admins can view all withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Admins can update withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "withdrawals_select_own" ON withdrawals;
DROP POLICY IF EXISTS "withdrawals_insert_own" ON withdrawals;
DROP POLICY IF EXISTS "withdrawals_admin_all" ON withdrawals;
DROP POLICY IF EXISTS "withdrawals_view" ON withdrawals;

DROP POLICY IF EXISTS "Admins can view all trades" ON trades;
DROP POLICY IF EXISTS "trades_select_own" ON trades;
DROP POLICY IF EXISTS "trades_admin_all" ON trades;
DROP POLICY IF EXISTS "trades_view" ON trades;
DROP POLICY IF EXISTS "trades_insert" ON trades;

DROP POLICY IF EXISTS "Users can view own API keys" ON user_binance_keys;
DROP POLICY IF EXISTS "Users can insert own API keys" ON user_binance_keys;
DROP POLICY IF EXISTS "Users can update own API keys" ON user_binance_keys;
DROP POLICY IF EXISTS "Users can delete own API keys" ON user_binance_keys;
DROP POLICY IF EXISTS "binance_keys_view_own" ON user_binance_keys;
DROP POLICY IF EXISTS "binance_keys_insert_own" ON user_binance_keys;
DROP POLICY IF EXISTS "binance_keys_update_own" ON user_binance_keys;
DROP POLICY IF EXISTS "binance_keys_delete_own" ON user_binance_keys;
DROP POLICY IF EXISTS "Service role can insert trades" ON trades;

-- STEP 2: Drop problematic trigger
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- STEP 3: Create admin_users whitelist table
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insert admin UID ONLY if user exists in auth.users
-- IMPORTANT: Replace 'cb26928a-6e50-4a5c-ad1d-c5c76caa98ad' with YOUR actual admin UID
DO $$
BEGIN
  -- Check if admin user exists in auth.users first
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = 'cb26928a-6e50-4a5c-ad1d-c5c76caa98ad') THEN
    INSERT INTO admin_users (user_id)
    VALUES ('cb26928a-6e50-4a5c-ad1d-c5c76caa98ad')
    ON CONFLICT (user_id) DO NOTHING;
    RAISE NOTICE 'Admin user inserted into admin_users table';
  ELSE
    RAISE NOTICE 'Admin user does not exist in auth.users - skipping insert';
    RAISE NOTICE 'You need to manually add admin UID after creating admin user';
  END IF;
END $$;

-- STEP 4: Create helper function to check if user is admin
-- ============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 5: NEW SIMPLE RLS POLICIES
-- ============================================

-- PROFILES
CREATE POLICY "profiles_view"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert"
  ON profiles FOR INSERT
  WITH CHECK (is_admin() OR auth.uid() = user_id);

CREATE POLICY "profiles_admin_update"
  ON profiles FOR UPDATE
  USING (is_admin());

CREATE POLICY "profiles_admin_delete"
  ON profiles FOR DELETE
  USING (is_admin());

-- BALANCES
CREATE POLICY "balances_view"
  ON balances FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "balances_update_own"
  ON balances FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "balances_insert"
  ON balances FOR INSERT
  WITH CHECK (is_admin() OR auth.uid() = user_id);

CREATE POLICY "balances_admin_update"
  ON balances FOR UPDATE
  USING (is_admin());

CREATE POLICY "balances_admin_delete"
  ON balances FOR DELETE
  USING (is_admin());

-- TRADING ACCESS
CREATE POLICY "trading_access_view"
  ON trading_access FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "trading_access_update_own"
  ON trading_access FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "trading_access_insert"
  ON trading_access FOR INSERT
  WITH CHECK (is_admin() OR auth.uid() = user_id);

CREATE POLICY "trading_access_admin_update"
  ON trading_access FOR UPDATE
  USING (is_admin());

CREATE POLICY "trading_access_admin_delete"
  ON trading_access FOR DELETE
  USING (is_admin());

-- WITHDRAWALS
CREATE POLICY "withdrawals_view"
  ON withdrawals FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "withdrawals_insert_own"
  ON withdrawals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "withdrawals_admin_all"
  ON withdrawals FOR ALL
  USING (is_admin());

-- TRADES
CREATE POLICY "trades_view"
  ON trades FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "trades_insert"
  ON trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- USER BINANCE KEYS
CREATE POLICY "binance_keys_view_own"
  ON user_binance_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "binance_keys_insert_own"
  ON user_binance_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "binance_keys_update_own"
  ON user_binance_keys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "binance_keys_delete_own"
  ON user_binance_keys FOR DELETE
  USING (auth.uid() = user_id);

-- STEP 6: Verification
-- ============================================
SELECT 'ALL POLICIES FIXED!' as status;

-- ============================================
-- IMPORTANT: ADD YOUR ADMIN UID
-- ============================================
-- If admin user was not inserted above, you need to add it manually:
-- 
-- STEP A: Find your admin UID
-- Run this query to find your admin user ID:
SELECT 
  id as admin_uid,
  email,
  created_at
FROM auth.users
WHERE email LIKE '%admin%' OR email LIKE '%your-admin-email%'
ORDER BY created_at DESC;

-- STEP B: Insert your admin UID into admin_users table
-- Replace 'YOUR_ADMIN_UID_HERE' with the actual UID from step A
-- Uncomment and run this line:
-- INSERT INTO admin_users (user_id) VALUES ('YOUR_ADMIN_UID_HERE') ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFY ADMIN SETUP
-- ============================================

-- Check policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'balances', 'trading_access', 'withdrawals', 'trades')
ORDER BY tablename, policyname;

-- Check admin users
SELECT * FROM admin_users;

-- Test admin function
SELECT is_admin() as am_i_admin;

