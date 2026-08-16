-- ============================================
-- TRADING TUTORIALS - ADMIN SYSTEM SETUP
-- ============================================
-- Run this AFTER running supabase-complete-setup.sql

-- ============================================
-- PART 1: ADD ROLE COLUMN TO PROFILES
-- ============================================

-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user'));

-- Create index for role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================
-- PART 2: CREATE WEBSITE SETTINGS TABLE (CMS)
-- ============================================

DROP TABLE IF EXISTS website_settings CASCADE;

CREATE TABLE website_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO website_settings (key, value, description) VALUES
  ('site_logo', '/logo.png', 'Website logo URL'),
  ('site_name', 'Trading Tutorials', 'Website name'),
  ('hero_image', '/hero.png', 'Hero section image URL'),
  ('contact_email', 'support@tradingtutorials.com', 'Contact email'),
  ('contact_phone', '+1 234 567 8900', 'Contact phone number');

-- Enable RLS
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;

-- Policies: Everyone can read, only admin can write
CREATE POLICY "Anyone can view website settings"
  ON website_settings FOR SELECT
  USING (true);

CREATE POLICY "Only admins can update website settings"
  ON website_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- PART 3: UPDATE RLS POLICIES FOR ADMIN ACCESS
-- ============================================

-- PROFILES: Admin can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- PROFILES: Admin can insert profiles (for adding customers)
CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- PROFILES: Admin can update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- BALANCES: Admin can view all balances
CREATE POLICY "Admins can view all balances"
  ON balances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- BALANCES: Admin can insert balances
CREATE POLICY "Admins can insert balances"
  ON balances FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- BALANCES: Admin can update balances
CREATE POLICY "Admins can update balances"
  ON balances FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- TRADING ACCESS: Admin can view all
CREATE POLICY "Admins can view all trading access"
  ON trading_access FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- TRADING ACCESS: Admin can insert
CREATE POLICY "Admins can insert trading access"
  ON trading_access FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- TRADING ACCESS: Admin can update
CREATE POLICY "Admins can update trading access"
  ON trading_access FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- WITHDRAWALS: Admin can view all
CREATE POLICY "Admins can view all withdrawals"
  ON withdrawals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- WITHDRAWALS: Admin can update (for approval)
CREATE POLICY "Admins can update withdrawals"
  ON withdrawals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- PART 4: CREATE ADMIN USER MANUALLY
-- ============================================
-- IMPORTANT: You need to create admin user in Supabase Auth Dashboard first
-- Email: admin@gmail.com
-- Password: trader1122
-- Then get the user_id and run this:

-- INSERT INTO profiles (user_id, full_name, email, role, investment_amount)
-- VALUES (
--   'PASTE_ADMIN_USER_ID_HERE',
--   'Admin User',
--   'admin@gmail.com',
--   'admin',
--   0.00
-- );

-- ============================================
-- SETUP COMPLETE!
-- ============================================
