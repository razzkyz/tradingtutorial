-- ============================================
-- MULTI-CURRENCY BALANCE UPDATE
-- ============================================
-- Run this script in Supabase SQL Editor to enable multi-currency support

-- Step 1: Add currency column to balances table
ALTER TABLE balances 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USDT';

-- Step 2: Update the UNIQUE constraint to include currency
ALTER TABLE balances DROP CONSTRAINT IF EXISTS balances_user_id_balance_type_key;
ALTER TABLE balances 
ADD CONSTRAINT balances_user_id_balance_type_currency_key 
UNIQUE(user_id, balance_type, currency);

-- Step 3: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_balances_currency ON balances(currency);

-- Step 4: Update existing records to have USDT as default currency
UPDATE balances SET currency = 'USDT' WHERE currency IS NULL;

-- ============================================
-- SAMPLE DATA: Create balances with different currencies
-- ============================================
-- Replace 'YOUR_USER_ID_HERE' with actual user UUID

-- Example: Insert BTC balance for balance_1
-- INSERT INTO balances (user_id, balance_type, currency, amount)
-- VALUES ('YOUR_USER_ID_HERE', 'balance_1', 'BTC', 0.05)
-- ON CONFLICT (user_id, balance_type, currency) DO NOTHING;

-- Example: Insert ETH balance for balance_2
-- INSERT INTO balances (user_id, balance_type, currency, amount)
-- VALUES ('YOUR_USER_ID_HERE', 'balance_2', 'ETH', 1.5)
-- ON CONFLICT (user_id, balance_type, currency) DO NOTHING;

-- ============================================
-- SUPPORTED CURRENCIES
-- ============================================
-- You can use any of these currencies:
-- - USDT (Tether)
-- - BTC (Bitcoin)
-- - ETH (Ethereum)
-- - BNB (Binance Coin)
-- - SOL (Solana)
-- - ADA (Cardano)
-- - XRP (Ripple)
-- - DOGE (Dogecoin)
-- - DOT (Polkadot)
-- - MATIC (Polygon)
-- Or any other custom currency code

-- ============================================
-- VERIFICATION
-- ============================================
-- Check the updated schema:
-- SELECT * FROM balances ORDER BY user_id, balance_type, currency;

SELECT 'Multi-currency balance update completed!' AS status;
