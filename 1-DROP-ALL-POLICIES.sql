-- ============================================
-- STEP 1: DROP ALL POLICIES (Run this FIRST!)
-- ============================================

-- This script drops ALL RLS policies from all tables
-- Run this first, then run 2-CREATE-POLICIES.sql

-- Drop ALL policies on profiles
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON profiles';
    END LOOP;
END $$;

-- Drop ALL policies on balances
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'balances' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON balances';
    END LOOP;
END $$;

-- Drop ALL policies on trading_access
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'trading_access' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON trading_access';
    END LOOP;
END $$;

-- Drop ALL policies on withdrawals
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'withdrawals' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON withdrawals';
    END LOOP;
END $$;

-- Drop ALL policies on trades
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'trades' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON trades';
    END LOOP;
END $$;

-- Drop ALL policies on user_binance_keys
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_binance_keys' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON user_binance_keys';
    END LOOP;
END $$;

-- Drop trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Verify all dropped
SELECT 'ALL POLICIES DROPPED!' as status;

-- Show remaining policies (should be empty or very few)
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'balances', 'trading_access', 'withdrawals', 'trades', 'user_binance_keys')
GROUP BY tablename;
