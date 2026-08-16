-- Trading Tutorials Database Setup
-- Run this script in your Supabase SQL Editor

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  address TEXT,
  phone_number TEXT,
  email TEXT NOT NULL,
  country TEXT,
  avatar_url TEXT,
  investment_amount NUMERIC(15, 2) DEFAULT 100.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Balances table
CREATE TABLE IF NOT EXISTS balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_type TEXT NOT NULL,
  amount NUMERIC(15, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, balance_type)
);

-- Trading Access table
CREATE TABLE IF NOT EXISTS trading_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  wallet_address TEXT NOT NULL,
  network TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_balances_user_id ON balances(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_access_user_id ON trading_access(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES - PROFILES
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- SELECT: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can create their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 5. CREATE RLS POLICIES - BALANCES
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own balances" ON balances;

-- SELECT: Users can view their own balances
CREATE POLICY "Users can view own balances"
  ON balances FOR SELECT
  USING (auth.uid() = user_id);

-- Note: No INSERT, UPDATE, DELETE for regular users
-- Balances are managed by admins only

-- ============================================
-- 6. CREATE RLS POLICIES - TRADING ACCESS
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own trading access" ON trading_access;

-- SELECT: Users can view their own trading access
CREATE POLICY "Users can view own trading access"
  ON trading_access FOR SELECT
  USING (auth.uid() = user_id);

-- Note: No UPDATE for regular users
-- Trading status is managed by admins only

-- ============================================
-- 7. CREATE RLS POLICIES - WITHDRAWALS
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Users can create own withdrawals" ON withdrawals;

-- SELECT: Users can view their own withdrawals
CREATE POLICY "Users can view own withdrawals"
  ON withdrawals FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can create withdrawal requests
CREATE POLICY "Users can create own withdrawals"
  ON withdrawals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Note: No UPDATE/DELETE for regular users
-- Withdrawal status is managed by admins only

-- ============================================
-- 8. CREATE UPDATED_AT TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_balances_updated_at ON balances;
CREATE TRIGGER update_balances_updated_at
  BEFORE UPDATE ON balances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trading_access_updated_at ON trading_access;
CREATE TRIGGER update_trading_access_updated_at
  BEFORE UPDATE ON trading_access
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_withdrawals_updated_at ON withdrawals;
CREATE TRIGGER update_withdrawals_updated_at
  BEFORE UPDATE ON withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. SEED DATA (OPTIONAL)
-- ============================================

-- IMPORTANT: First create a test user via Supabase Auth Dashboard
-- Then replace 'YOUR_USER_UUID_HERE' with the actual user UUID

-- Example seed data (uncomment and update user_id):
/*
-- Seed profile
INSERT INTO profiles (user_id, full_name, email, address, phone_number, country, investment_amount)
VALUES 
  ('YOUR_USER_UUID_HERE', 'Mark Cloop', 'markcloop@gmail.com', 'California', '+15553633566', 'America', 100.00)
ON CONFLICT (user_id) DO NOTHING;

-- Seed balances
INSERT INTO balances (user_id, balance_type, amount)
VALUES 
  ('YOUR_USER_UUID_HERE', 'balance_1', 200.00),
  ('YOUR_USER_UUID_HERE', 'balance_2', 400.00),
  ('YOUR_USER_UUID_HERE', 'balance_3', 500.00),
  ('YOUR_USER_UUID_HERE', 'balance_4', 700.00)
ON CONFLICT (user_id, balance_type) DO NOTHING;

-- Seed trading access
INSERT INTO trading_access (user_id, status)
VALUES 
  ('YOUR_USER_UUID_HERE', 'inactive')
ON CONFLICT (user_id) DO NOTHING;
*/

-- ============================================
-- 10. VERIFICATION QUERIES
-- ============================================

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'balances', 'trading_access', 'withdrawals');

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'balances', 'trading_access', 'withdrawals');

-- Check policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- ============================================
-- SETUP COMPLETE
-- ============================================

-- Next steps:
-- 1. Create a test user via Supabase Auth Dashboard
-- 2. Copy the user UUID
-- 3. Update and run the seed data section above
-- 4. Test the application with the test credentials
