-- ============================================
-- COMPLETE SUPABASE MIGRATION SQL
-- Trading Tutorials Platform + Binance Trading
-- ============================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  address TEXT,
  country TEXT,
  avatar_url TEXT,
  investment_amount DECIMAL DEFAULT 100,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. BALANCES TABLE (Multi-currency support)
CREATE TABLE IF NOT EXISTS balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_type TEXT NOT NULL CHECK (balance_type IN ('balance_1', 'balance_2', 'balance_3', 'balance_4')),
  currency TEXT DEFAULT 'USDT',
  amount DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, balance_type, currency)
);

-- 3. TRADING ACCESS TABLE
CREATE TABLE IF NOT EXISTS trading_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. WITHDRAWALS TABLE
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  wallet_address TEXT NOT NULL,
  network TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. BINANCE API KEYS TABLE (for trading)
CREATE TABLE IF NOT EXISTS user_binance_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  api_key TEXT NOT NULL,
  api_secret TEXT NOT NULL,
  testnet BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 6. TRADES TABLE (Trading history)
CREATE TABLE IF NOT EXISTS trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
  quantity DECIMAL NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('MARKET', 'LIMIT')),
  status TEXT,
  order_id TEXT,
  executed_qty DECIMAL,
  price DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_binance_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - PROFILES
-- ============================================

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- RLS POLICIES - BALANCES
-- ============================================

CREATE POLICY "Users can view own balances"
  ON balances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own balances"
  ON balances FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all balances"
  ON balances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert balances"
  ON balances FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all balances"
  ON balances FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- RLS POLICIES - TRADING ACCESS
-- ============================================

CREATE POLICY "Users can view own trading access"
  ON trading_access FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all trading access"
  ON trading_access FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert trading access"
  ON trading_access FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update trading access"
  ON trading_access FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- RLS POLICIES - WITHDRAWALS
-- ============================================

CREATE POLICY "Users can view own withdrawals"
  ON withdrawals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own withdrawals"
  ON withdrawals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all withdrawals"
  ON withdrawals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update withdrawals"
  ON withdrawals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- RLS POLICIES - BINANCE API KEYS
-- ============================================

CREATE POLICY "Users can view own API keys"
  ON user_binance_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys"
  ON user_binance_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
  ON user_binance_keys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
  ON user_binance_keys FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - TRADES
-- ============================================

CREATE POLICY "Users can view own trades"
  ON trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert trades"
  ON trades FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all trades"
  ON trades FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_balances_user_id ON balances(user_id);
CREATE INDEX idx_balances_type ON balances(balance_type);
CREATE INDEX idx_trading_access_user_id ON trading_access(user_id);
CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_user_binance_keys_user_id ON user_binance_keys(user_id);
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_created_at ON trades(created_at DESC);
CREATE INDEX idx_trades_symbol ON trades(symbol);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_balances_updated_at BEFORE UPDATE ON balances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trading_access_updated_at BEFORE UPDATE ON trading_access
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_withdrawals_updated_at BEFORE UPDATE ON withdrawals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_binance_keys_updated_at BEFORE UPDATE ON user_binance_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DEMO DATA (Optional - Remove in production)
-- ============================================

-- Insert demo admin user (after creating auth user manually)
-- Replace 'YOUR_AUTH_USER_ID' with actual UUID from auth.users
/*
INSERT INTO profiles (user_id, full_name, email, role, investment_amount)
VALUES ('YOUR_AUTH_USER_ID', 'Admin User', 'admin@tradingtutorials.com', 'admin', 10000)
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Insert demo balances
INSERT INTO balances (user_id, balance_type, currency, amount)
VALUES 
  ('YOUR_AUTH_USER_ID', 'balance_1', 'USDT', 200),
  ('YOUR_AUTH_USER_ID', 'balance_2', 'USDT', 400),
  ('YOUR_AUTH_USER_ID', 'balance_3', 'USDT', 500),
  ('YOUR_AUTH_USER_ID', 'balance_4', 'USDT', 700)
ON CONFLICT (user_id, balance_type, currency) DO NOTHING;

-- Insert demo trading access
INSERT INTO trading_access (user_id, status)
VALUES ('YOUR_AUTH_USER_ID', 'inactive')
ON CONFLICT (user_id) DO NOTHING;
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these after migration to verify:
-- SELECT * FROM profiles;
-- SELECT * FROM balances;
-- SELECT * FROM trading_access;
-- SELECT * FROM withdrawals;
-- SELECT * FROM user_binance_keys;
-- SELECT * FROM trades;
