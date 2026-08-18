# Database Setup Guide

Complete guide for setting up the Trading Tutorials database on Supabase.

---

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Setup](#quick-setup)
- [Detailed Setup Steps](#detailed-setup-steps)
- [Creating Admin User](#creating-admin-user)
- [Adding Demo Users](#adding-demo-users)
- [Database Schema Overview](#database-schema-overview)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, make sure you have:
- A Supabase account ([sign up here](https://supabase.com))
- A Supabase project created
- Access to your project's SQL Editor
- Your Supabase project URL and anon key

---

## Quick Setup

For a complete database setup in one step:

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor in the left sidebar

2. **Run the Complete Setup Script**
   - Open the file: `database/00-COMPLETE-DATABASE-SETUP.sql`
   - Copy the entire content
   - Paste into Supabase SQL Editor
   - Click "Run" or press Ctrl+Enter

3. **Create Admin User**
   - Go to Authentication > Users
   - Click "Add user"
   - Enter email (e.g., `admin@tradingtutorials.com`)
   - Enter password
   - Click "Create user"

4. **Set Admin Role**
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE email = 'admin@tradingtutorials.com';
   ```

✅ **Done!** Your database is now ready to use.

---

## Detailed Setup Steps

### Step 1: Understanding the Database Structure

The database consists of 4 main tables:

1. **profiles** - User profile information (extends Supabase auth.users)
2. **balances** - Multi-currency balance tracking
3. **withdrawals** - Withdrawal request management
4. **binance_api_keys** - Binance API key storage for trading

### Step 2: Execute Setup Script

The `00-COMPLETE-DATABASE-SETUP.sql` file includes:

- ✅ Table creation with proper constraints
- ✅ Indexes for performance optimization
- ✅ Storage bucket for avatar images
- ✅ Row Level Security (RLS) policies
- ✅ Automatic timestamp triggers
- ✅ Auto-profile creation on user signup
- ✅ Clean slate (drops old policies)

### Step 3: Verify Setup

After running the setup script, verify everything is working:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'balances', 'withdrawals', 'binance_api_keys');

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'balances', 'withdrawals', 'binance_api_keys');

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'avatars';
```

---

## Creating Admin User

### Method 1: Via Supabase Dashboard (Recommended)

1. Navigate to **Authentication** > **Users**
2. Click **"Add user"**
3. Fill in the form:
   - Email: `admin@tradingtutorials.com`
   - Password: Create a strong password
   - Auto Confirm User: ✅ Enable
4. Click **"Create user"**
5. Run this SQL to set admin role:
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE email = 'admin@tradingtutorials.com';
   ```

### Method 2: Via SQL (Alternative)

```sql
-- First, create the user in auth.users via dashboard
-- Then update the profile role
UPDATE profiles
SET role = 'admin'
WHERE email = 'YOUR-ADMIN-EMAIL@example.com';
```

### Verify Admin Access

```sql
-- Check admin profile
SELECT id, user_id, email, role, created_at
FROM profiles
WHERE role = 'admin';
```

---

## Adding Demo Users

For testing and development, use the demo users script:

1. **Open**: `database/INSERT-DEMO-USERS.sql`
2. **Create users in Supabase Auth Dashboard** (see Method 1 above)
3. **Update UUIDs** in the SQL file:
   - Replace `REPLACE-WITH-USER1-UUID` with actual UUID
   - Replace `REPLACE-WITH-USER2-UUID` with actual UUID
   - Replace `REPLACE-WITH-USER3-UUID` with actual UUID
4. **Run the script** in SQL Editor

Demo users include:
- **user1@demo.com** - Basic user with USDT balance
- **user2@demo.com** - User with multiple currencies
- **user3@demo.com** - User with withdrawal history

---

## Database Schema Overview

### Profiles Table
```sql
- id: UUID (primary key)
- user_id: UUID (references auth.users)
- full_name: TEXT
- email: TEXT
- address: TEXT
- phone_number: TEXT
- country: TEXT
- role: TEXT (user/admin)
- avatar_url: TEXT
- investment_amount: DECIMAL(15,2)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Balances Table
```sql
- id: UUID (primary key)
- user_id: UUID (references auth.users)
- currency: TEXT (default: USDT)
- amount: DECIMAL(15,2)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- UNIQUE constraint on (user_id, currency)
```

### Withdrawals Table
```sql
- id: UUID (primary key)
- user_id: UUID (references auth.users)
- amount: DECIMAL(15,2)
- currency: TEXT
- wallet_address: TEXT
- network: TEXT
- status: TEXT (pending/approved/rejected/completed)
- admin_notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Binance API Keys Table
```sql
- id: UUID (primary key)
- user_id: UUID (references auth.users)
- api_key: TEXT
- api_secret: TEXT
- is_active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

---

## Row Level Security (RLS) Policies

### User Permissions
- ✅ View own profile
- ✅ Update own profile
- ✅ View own balance
- ✅ View own withdrawals
- ✅ Create withdrawal requests
- ✅ Manage own Binance API keys

### Admin Permissions
- ✅ View all profiles
- ✅ Update all profiles
- ✅ Create profiles
- ✅ View all balances
- ✅ Update/create balances
- ✅ View all withdrawals
- ✅ Update withdrawal status

---

## Helper Scripts

Located in `database/` folder:

- **00-COMPLETE-DATABASE-SETUP.sql** - Main setup script (use this!)
- **3-ADD-ADMIN.sql** - Quick admin role assignment
- **INSERT-DEMO-USERS.sql** - Demo users for testing
- **insert-initial-data.sql** - Additional initial data
- **INSERT-DUMMY-USER.sql** - Quick single dummy user

---

## Troubleshooting

### Issue: Profile not created after user signup

**Solution**: Check if the trigger is active
```sql
-- Verify trigger exists
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- If missing, recreate it
-- Run section 8 from 00-COMPLETE-DATABASE-SETUP.sql
```

### Issue: RLS policies blocking access

**Solution**: Verify user role
```sql
-- Check current user's profile
SELECT * FROM profiles WHERE user_id = auth.uid();

-- Check if admin role is set
SELECT role FROM profiles WHERE user_id = auth.uid();
```

### Issue: Cannot upload avatar

**Solution**: Check storage bucket and policies
```sql
-- Verify bucket exists
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Check storage policies
SELECT * FROM pg_policies WHERE tablename = 'objects';
```

### Issue: Duplicate key error on user creation

**Solution**: Profile already exists, update instead
```sql
-- Update existing profile instead of insert
UPDATE profiles 
SET role = 'admin'
WHERE email = 'user@example.com';
```

---

## Environment Variables

After database setup, update your `.env` file:

```env
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from: **Project Settings** > **API** in Supabase dashboard

---

## Next Steps

After database setup:
1. ✅ Configure environment variables (`.env`)
2. ✅ Create admin user
3. ✅ Test user registration
4. ✅ Test login/logout
5. ✅ Test balance display
6. ✅ Test withdrawal creation
7. ✅ Configure Binance API (optional)

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- Project Documentation: `docs/README.md`
- Authentication Guide: `docs/AUTHENTICATION-FIX-COMPLETE.md`
- Admin Guide: `docs/ADMIN-SETUP-GUIDE.md`

---

**Need Help?** Check other documentation files in the `docs/` folder or refer to the Supabase documentation.
