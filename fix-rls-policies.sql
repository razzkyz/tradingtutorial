-- ============================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- ============================================

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;

DROP POLICY IF EXISTS "Users can view own balances" ON balances;
DROP POLICY IF EXISTS "Users can update own balances" ON balances;
DROP POLICY IF EXISTS "Admins can view all balances" ON balances;
DROP POLICY IF EXISTS "Admins can insert balances" ON balances;
DROP POLICY IF EXISTS "Admins can update all balances" ON balances;

DROP POLICY IF EXISTS "Users can view own trading access" ON trading_access;
DROP POLICY IF EXISTS "Admins can view all trading access" ON trading_access;
DROP POLICY IF EXISTS "Admins can insert trading access" ON trading_access;
DROP POLICY IF EXISTS "Admins can update trading access" ON trading_access;

DROP POLICY IF EXISTS "Users can view own withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Users can insert own withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Admins can view all withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Admins can update withdrawals" ON withdrawals;

DROP POLICY IF EXISTS "Admins can view all trades" ON trades;

-- ============================================
-- NEW SIMPLIFIED RLS POLICIES (No recursion)
-- ============================================

-- PROFILES: Users can only see/update their own
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- BALANCES: Users can only see/update their own
CREATE POLICY "balances_select_own"
  ON balances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "balances_update_own"
  ON balances FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "balances_insert_own"
  ON balances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- TRADING ACCESS: Users can only see their own
CREATE POLICY "trading_access_select_own"
  ON trading_access FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "trading_access_insert_own"
  ON trading_access FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trading_access_update_own"
  ON trading_access FOR UPDATE
  USING (auth.uid() = user_id);

-- WITHDRAWALS: Users can view and insert their own
CREATE POLICY "withdrawals_select_own"
  ON withdrawals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "withdrawals_insert_own"
  ON withdrawals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- TRADES: Users can view their own
CREATE POLICY "trades_select_own"
  ON trades FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- ADMIN ACCESS via Service Role
-- ============================================
-- Note: Admin pages will use service role key in backend
-- Or use Supabase Functions with service role
-- Frontend will check role in React code (already done)

-- For now, if you need admin to access all data in frontend,
-- you can use this approach:
-- 1. Store admin UIDs in a separate table
-- 2. Or use custom claims in JWT
-- 3. Or bypass RLS using service role key (backend only!)

-- Option: Create admin_users table for whitelist
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insert admin UIDs
INSERT INTO admin_users (user_id)
VALUES ('cb26928a-6e50-4a5c-ad1d-c5c76caa98ad')
ON CONFLICT (user_id) DO NOTHING;

-- Now add admin policies using admin_users table (no recursion!)
CREATE POLICY "profiles_admin_all"
  ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "balances_admin_all"
  ON balances FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "trading_access_admin_all"
  ON trading_access FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "withdrawals_admin_all"
  ON withdrawals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "trades_admin_all"
  ON trades FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- VERIFICATION
-- ============================================

-- Drop the trigger that auto-creates profile (causes RLS issues with admin.createUser)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- We'll handle profile creation manually in AddCustomer.tsx
-- This gives admin full control and avoids RLS policy violations

SELECT 'RLS Policies Fixed!' as status;
