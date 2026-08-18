-- ============================================================================
-- INSERT DEMO USERS
-- ============================================================================
-- This file creates demo users for testing and development
-- WARNING: Use only in development environment, NOT in production!
-- ============================================================================

-- ============================================================================
-- DEMO USER 1: Regular User with Balance
-- ============================================================================
-- Email: user1@demo.com
-- Password: Demo123!
-- Role: user
-- Balance: 5000 USDT
-- Investment Amount: 10000 USDT

-- NOTE: You need to create this user in Supabase Auth Dashboard first
-- Then update the user_id below with the actual UUID from auth.users

-- Example: Get user_id after creating user in Auth Dashboard
-- SELECT id, email FROM auth.users WHERE email = 'user1@demo.com';

-- Insert/Update profile
INSERT INTO profiles (user_id, email, full_name, role, investment_amount, phone_number, country, address)
VALUES (
  'REPLACE-WITH-USER1-UUID'::uuid,
  'user1@demo.com',
  'Demo User One',
  'user',
  10000.00,
  '+1234567890',
  'United States',
  '123 Demo Street, Demo City'
)
ON CONFLICT (user_id) DO UPDATE
SET 
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  investment_amount = EXCLUDED.investment_amount,
  phone_number = EXCLUDED.phone_number,
  country = EXCLUDED.country,
  address = EXCLUDED.address;

-- Insert balance for user1
INSERT INTO balances (user_id, currency, amount)
VALUES (
  'REPLACE-WITH-USER1-UUID'::uuid,
  'USDT',
  5000.00
)
ON CONFLICT (user_id, currency) DO UPDATE
SET amount = EXCLUDED.amount;

-- ============================================================================
-- DEMO USER 2: Regular User with Multiple Currencies
-- ============================================================================
-- Email: user2@demo.com
-- Password: Demo123!
-- Role: user
-- Balances: 3000 USDT, 0.5 BTC, 10 ETH
-- Investment Amount: 25000 USDT

-- Insert/Update profile
INSERT INTO profiles (user_id, email, full_name, role, investment_amount, phone_number, country)
VALUES (
  'REPLACE-WITH-USER2-UUID'::uuid,
  'user2@demo.com',
  'Demo User Two',
  'user',
  25000.00,
  '+9876543210',
  'Singapore'
)
ON CONFLICT (user_id) DO UPDATE
SET 
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  investment_amount = EXCLUDED.investment_amount,
  phone_number = EXCLUDED.phone_number,
  country = EXCLUDED.country;

-- Insert multiple currency balances for user2
INSERT INTO balances (user_id, currency, amount)
VALUES 
  ('REPLACE-WITH-USER2-UUID'::uuid, 'USDT', 3000.00),
  ('REPLACE-WITH-USER2-UUID'::uuid, 'BTC', 0.5),
  ('REPLACE-WITH-USER2-UUID'::uuid, 'ETH', 10.00)
ON CONFLICT (user_id, currency) DO UPDATE
SET amount = EXCLUDED.amount;

-- ============================================================================
-- DEMO USER 3: User with Withdrawal History
-- ============================================================================
-- Email: user3@demo.com
-- Password: Demo123!
-- Role: user
-- Balance: 2000 USDT
-- Investment Amount: 5000 USDT
-- Has pending and completed withdrawals

-- Insert/Update profile
INSERT INTO profiles (user_id, email, full_name, role, investment_amount)
VALUES (
  'REPLACE-WITH-USER3-UUID'::uuid,
  'user3@demo.com',
  'Demo User Three',
  'user',
  5000.00
)
ON CONFLICT (user_id) DO UPDATE
SET 
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  investment_amount = EXCLUDED.investment_amount;

-- Insert balance for user3
INSERT INTO balances (user_id, currency, amount)
VALUES (
  'REPLACE-WITH-USER3-UUID'::uuid,
  'USDT',
  2000.00
)
ON CONFLICT (user_id, currency) DO UPDATE
SET amount = EXCLUDED.amount;

-- Insert withdrawal history for user3
INSERT INTO withdrawals (user_id, amount, currency, wallet_address, network, status, admin_notes)
VALUES 
  (
    'REPLACE-WITH-USER3-UUID'::uuid,
    500.00,
    'USDT',
    '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    'ERC20',
    'completed',
    'Processed successfully'
  ),
  (
    'REPLACE-WITH-USER3-UUID'::uuid,
    1000.00,
    'USDT',
    'TYASr5UV6HEcXatwdFQfmLVUqQQQMUxHLS',
    'TRC20',
    'pending',
    NULL
  );

-- ============================================================================
-- INSTRUCTIONS
-- ============================================================================
-- 
-- Step 1: Create users in Supabase Auth Dashboard
--   1. Go to Authentication > Users in your Supabase dashboard
--   2. Click "Add user" and create each demo user with their email and password
--   3. Note down each user's UUID from the auth.users table
--
-- Step 2: Update UUIDs in this file
--   Replace all instances of:
--   - 'REPLACE-WITH-USER1-UUID' with actual UUID for user1@demo.com
--   - 'REPLACE-WITH-USER2-UUID' with actual UUID for user2@demo.com
--   - 'REPLACE-WITH-USER3-UUID' with actual UUID for user3@demo.com
--
-- Step 3: Execute this file
--   Run this entire file in Supabase SQL Editor
--
-- Step 4: Verify
--   - Login with demo user credentials
--   - Check balances are correctly displayed
--   - Test withdrawal functionality with user3
--
-- ============================================================================
