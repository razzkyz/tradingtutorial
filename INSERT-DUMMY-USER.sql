-- ============================================
-- INSERT DUMMY USER - Mark Cloop
-- ============================================
-- User ini untuk testing
-- Email: demo@tradingtutorials.com
-- Password: Demo123456!
-- UUID: 4662bbd2-a871-4877-b4c5-f114902a710b

-- ============================================
-- STEP 1: CREATE AUTH USER DULU DI SUPABASE DASHBOARD
-- ============================================
-- Buka Authentication → Users → Add User → Create New User
-- Email: demo@tradingtutorials.com
-- Password: Demo123456!
-- Auto Confirm: YES ✅
-- User ID akan: 4662bbd2-a871-4877-b4c5-f114902a710b

-- ============================================
-- STEP 2: RUN SQL INI SETELAH CREATE AUTH USER
-- ============================================

-- Insert Profile
INSERT INTO profiles (user_id, full_name, email, address, phone_number, country, investment_amount, role)
VALUES (
  '4662bbd2-a871-4877-b4c5-f114902a710b',
  'Mark Cloop',
  'demo@tradingtutorials.com',
  'California, United States',
  '+15553633566',
  'America',
  100.00,
  'user'
) ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  address = EXCLUDED.address,
  phone_number = EXCLUDED.phone_number,
  country = EXCLUDED.country,
  investment_amount = EXCLUDED.investment_amount,
  role = EXCLUDED.role;

-- Insert Balances (4 balances: 200, 400, 500, 700 = 1800 total)
INSERT INTO balances (user_id, balance_type, amount)
VALUES 
  ('4662bbd2-a871-4877-b4c5-f114902a710b', 'balance_1', 200.00),
  ('4662bbd2-a871-4877-b4c5-f114902a710b', 'balance_2', 400.00),
  ('4662bbd2-a871-4877-b4c5-f114902a710b', 'balance_3', 500.00),
  ('4662bbd2-a871-4877-b4c5-f114902a710b', 'balance_4', 700.00)
ON CONFLICT (user_id, balance_type) DO UPDATE SET
  amount = EXCLUDED.amount;

-- Insert Trading Access (inactive by default)
INSERT INTO trading_access (user_id, status)
VALUES (
  '4662bbd2-a871-4877-b4c5-f114902a710b',
  'inactive'
) ON CONFLICT (user_id) DO UPDATE SET
  status = EXCLUDED.status;

-- ============================================
-- VERIFICATION
-- ============================================
-- Cek apakah data sudah masuk:

SELECT 
  p.full_name,
  p.email,
  p.role,
  (SELECT SUM(amount) FROM balances WHERE user_id = p.user_id) as total_balance,
  t.status as trading_status
FROM profiles p
LEFT JOIN trading_access t ON t.user_id = p.user_id
WHERE p.email = 'demo@tradingtutorials.com';

-- Expected result:
-- full_name: Mark Cloop
-- email: demo@tradingtutorials.com
-- role: user
-- total_balance: 1800.00
-- trading_status: inactive

-- ============================================
-- LOGIN CREDENTIALS
-- ============================================
-- Email: demo@tradingtutorials.com
-- Password: Demo123456!
-- ============================================
