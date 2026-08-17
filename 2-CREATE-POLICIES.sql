-- ============================================
-- STEP 2: CREATE NEW POLICIES (Run AFTER step 1!)
-- ============================================

-- Create admin_users table for whitelist
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Disable RLS on admin_users table (it's just a whitelist)
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RLS POLICIES - PROFILES
-- ============================================

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

-- ============================================
-- RLS POLICIES - BALANCES
-- ============================================

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

-- ============================================
-- RLS POLICIES - TRADING ACCESS
-- ============================================

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

-- ============================================
-- RLS POLICIES - WITHDRAWALS
-- ============================================

CREATE POLICY "withdrawals_view"
  ON withdrawals FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "withdrawals_insert_own"
  ON withdrawals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "withdrawals_admin_all"
  ON withdrawals FOR ALL
  USING (is_admin());

-- ============================================
-- RLS POLICIES - TRADES
-- ============================================

CREATE POLICY "trades_view"
  ON trades FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "trades_insert"
  ON trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - USER BINANCE KEYS
-- ============================================

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

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'ALL POLICIES CREATED!' as status;

-- Count policies per table
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'balances', 'trading_access', 'withdrawals', 'trades', 'user_binance_keys')
GROUP BY tablename
ORDER BY tablename;
