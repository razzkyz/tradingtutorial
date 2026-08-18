-- ============================================
-- INSERT INITIAL DATA
-- Admin & Demo User Setup
-- ============================================

-- Admin User ID
-- cb26928a-6e50-4a5c-ad1d-c5c76caa98ad

-- ============================================
-- 1. INSERT ADMIN PROFILE
-- ============================================

INSERT INTO profiles (user_id, full_name, email, role, investment_amount, phone_number, country)
VALUES (
  'cb26928a-6e50-4a5c-ad1d-c5c76caa98ad',
  'Admin',
  'admin@tradingtutorials.com',
  'admin',
  50000,
  '+1234567890',
  'Indonesia'
)
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = 'admin',
  full_name = 'Admin',
  investment_amount = 50000;

-- ============================================
-- 2. INSERT ADMIN BALANCES
-- ============================================

INSERT INTO balances (user_id, balance_type, currency, amount)
VALUES 
  ('cb26928a-6e50-4a5c-ad1d-c5c76caa98ad', 'balance_1', 'USDT', 5000),
  ('cb26928a-6e50-4a5c-ad1d-c5c76caa98ad', 'balance_2', 'USDT', 10000),
  ('cb26928a-6e50-4a5c-ad1d-c5c76caa98ad', 'balance_3', 'USDT', 15000),
  ('cb26928a-6e50-4a5c-ad1d-c5c76caa98ad', 'balance_4', 'USDT', 20000)
ON CONFLICT (user_id, balance_type, currency) 
DO UPDATE SET amount = EXCLUDED.amount;

-- ============================================
-- 3. INSERT ADMIN TRADING ACCESS
-- ============================================

INSERT INTO trading_access (user_id, status)
VALUES ('cb26928a-6e50-4a5c-ad1d-c5c76caa98ad', 'active')
ON CONFLICT (user_id) 
DO UPDATE SET status = 'active';

-- ============================================
-- 4. INSERT DEMO USER PROFILE
-- ============================================

-- Demo User ID: 4af0217f-1275-4fbb-858a-8883f2ce733a

INSERT INTO profiles (user_id, full_name, email, role, investment_amount, phone_number, country)
VALUES (
  '4af0217f-1275-4fbb-858a-8883f2ce733a',
  'Mark Cloop',
  'demo@tradingtutorials.com',
  'user',
  1800,
  '+62812345678',
  'Indonesia'
)
ON CONFLICT (user_id) 
DO UPDATE SET 
  full_name = 'Mark Cloop',
  investment_amount = 1800;

-- Demo User Balances
INSERT INTO balances (user_id, balance_type, currency, amount)
VALUES 
  ('4af0217f-1275-4fbb-858a-8883f2ce733a', 'balance_1', 'USDT', 200),
  ('4af0217f-1275-4fbb-858a-8883f2ce733a', 'balance_2', 'USDT', 400),
  ('4af0217f-1275-4fbb-858a-8883f2ce733a', 'balance_3', 'USDT', 500),
  ('4af0217f-1275-4fbb-858a-8883f2ce733a', 'balance_4', 'USDT', 700)
ON CONFLICT (user_id, balance_type, currency) 
DO UPDATE SET amount = EXCLUDED.amount;

-- Demo User Trading Access
INSERT INTO trading_access (user_id, status)
VALUES ('4af0217f-1275-4fbb-858a-8883f2ce733a', 'inactive')
ON CONFLICT (user_id) 
DO UPDATE SET status = 'inactive';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check Admin
SELECT 
  p.user_id,
  p.full_name,
  p.email,
  p.role,
  p.investment_amount,
  ta.status as trading_status,
  COALESCE(SUM(b.amount), 0) as total_balance
FROM profiles p
LEFT JOIN trading_access ta ON p.user_id = ta.user_id
LEFT JOIN balances b ON p.user_id = b.user_id
WHERE p.user_id = 'cb26928a-6e50-4a5c-ad1d-c5c76caa98ad'
GROUP BY p.user_id, p.full_name, p.email, p.role, p.investment_amount, ta.status;

-- Check Demo User
SELECT 
  p.user_id,
  p.full_name,
  p.email,
  p.role,
  p.investment_amount,
  ta.status as trading_status,
  COALESCE(SUM(b.amount), 0) as total_balance
FROM profiles p
LEFT JOIN trading_access ta ON p.user_id = ta.user_id
LEFT JOIN balances b ON p.user_id = b.user_id
WHERE p.user_id = '4af0217f-1275-4fbb-858a-8883f2ce733a'
GROUP BY p.user_id, p.full_name, p.email, p.role, p.investment_amount, ta.status;

-- Check All Users
SELECT 
  p.user_id,
  p.full_name,
  p.email,
  p.role,
  COALESCE(SUM(b.amount), 0) as total_balance,
  ta.status as trading_status
FROM profiles p
LEFT JOIN balances b ON p.user_id = b.user_id
LEFT JOIN trading_access ta ON p.user_id = ta.user_id
GROUP BY p.user_id, p.full_name, p.email, p.role, ta.status
ORDER BY p.created_at DESC;

-- Check Admin Balances Detail
SELECT 
  p.full_name,
  p.email,
  b.balance_type,
  b.currency,
  b.amount
FROM profiles p
JOIN balances b ON p.user_id = b.user_id
WHERE p.user_id = 'cb26928a-6e50-4a5c-ad1d-c5c76caa98ad'
ORDER BY b.balance_type;

-- Check Demo User Balances Detail
SELECT 
  p.full_name,
  p.email,
  b.balance_type,
  b.currency,
  b.amount
FROM profiles p
JOIN balances b ON p.user_id = b.user_id
WHERE p.user_id = '4af0217f-1275-4fbb-858a-8883f2ce733a'
ORDER BY b.balance_type;
