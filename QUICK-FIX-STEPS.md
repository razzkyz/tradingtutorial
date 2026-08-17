# 🚀 QUICK FIX STEPS - Admin Features

## Error yang Anda alami:
```
ERROR: insert or update on table "profiles" violates foreign key constraint
Key (user_id)=(cb26928a-6e50-4a5c-ad1d-c5c76caa98ad) is not present in table "users"
```

**Artinya:** Admin user dengan UID tersebut belum dibuat di Authentication.

---

## ✅ SOLUSI (IKUTI URUTAN!)

### STEP 1: Buat Admin User di Supabase Authentication (Kalau Belum Ada)

1. Buka Supabase Dashboard: https://fcgfnuydswfxwqrqqlup.supabase.co
2. Go to **Authentication** > **Users**
3. Click **Add User** (atau **Invite User**)
4. Fill:
   - Email: `admin@tradingtutorials.com` (atau email admin Anda)
   - Password: (buat password yang kuat)
   - ✅ Check "Auto Confirm User" (penting!)
5. Click **Create User**
6. **COPY UID** yang baru dibuat (contoh: `cb26928a-6e50-4a5c-ad1d-c5c76caa98ad`)

---

### STEP 2: Run RESET-AND-FIX-ALL.sql

1. Buka **SQL Editor** di Supabase
2. Copy **SEMUA isi** file `RESET-AND-FIX-ALL.sql`
3. Paste ke SQL Editor
4. Click **Run** (Ctrl+Enter)
5. ✅ Harusnya sukses sekarang (policies fixed)

---

### STEP 3: Find Admin UID (Kalau Tidak Tahu)

Run query ini di SQL Editor:

```sql
-- Find admin user UID
SELECT 
  id as admin_uid,
  email,
  created_at,
  'Copy this UID! ☝️' as note
FROM auth.users
WHERE email = 'admin@tradingtutorials.com'
  OR email LIKE '%admin%'
ORDER BY created_at DESC
LIMIT 5;
```

**Copy UID dari result** (kolom `admin_uid`)

---

### STEP 4: Insert Admin UID ke admin_users Table

Replace `YOUR_ADMIN_UID_HERE` dengan UID yang Anda copy di Step 3:

```sql
-- Insert your admin UID
INSERT INTO admin_users (user_id)
VALUES ('YOUR_ADMIN_UID_HERE')
ON CONFLICT (user_id) DO NOTHING;

-- Verify
SELECT 
  au.user_id,
  u.email,
  'Admin added successfully! ✅' as status
FROM admin_users au
JOIN auth.users u ON au.user_id = u.id;
```

Expected result:
| user_id | email | status |
|---------|-------|--------|
| YOUR_UID | admin@... | Admin added successfully! ✅ |

---

### STEP 5: Insert Admin Profile Data

Setelah admin UID masuk ke `admin_users`, insert profile data:

```sql
-- Insert admin profile
INSERT INTO profiles (user_id, full_name, email, role, investment_amount)
VALUES (
  'YOUR_ADMIN_UID_HERE',  -- Replace with your admin UID
  'Admin',
  'admin@tradingtutorials.com',  -- Replace with your admin email
  'admin',
  50000
)
ON CONFLICT (user_id) DO UPDATE 
SET role = 'admin', full_name = 'Admin';

-- Insert admin balances
INSERT INTO balances (user_id, balance_type, currency, amount)
VALUES 
  ('YOUR_ADMIN_UID_HERE', 'balance_1', 'USDT', 5000),
  ('YOUR_ADMIN_UID_HERE', 'balance_2', 'USDT', 10000),
  ('YOUR_ADMIN_UID_HERE', 'balance_3', 'USDT', 15000),
  ('YOUR_ADMIN_UID_HERE', 'balance_4', 'USDT', 20000)
ON CONFLICT (user_id, balance_type, currency) 
DO UPDATE SET amount = EXCLUDED.amount;

-- Insert admin trading access
INSERT INTO trading_access (user_id, status)
VALUES ('YOUR_ADMIN_UID_HERE', 'active')
ON CONFLICT (user_id) DO UPDATE SET status = 'active';

-- Verify admin data
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
WHERE p.user_id = 'YOUR_ADMIN_UID_HERE'
GROUP BY p.user_id, p.full_name, p.email, p.role, ta.status;
```

---

### STEP 6: Logout & Login

1. **Logout** dari aplikasi
2. **Clear cache** (Ctrl+Shift+Del)
3. **Login** dengan email admin yang baru dibuat
4. Go to `/admin/dashboard`
5. ✅ Harusnya masuk ke admin dashboard

---

### STEP 7: Test Admin Features

- ✅ `/admin/dashboard` - admin dashboard muncul
- ✅ `/admin/customers` - manage customers (bisa load data)
- ✅ `/admin/add-customer` - add customer (tanpa error)

---

## 🎯 ATAU: INSERT DEMO USER (Alternatif untuk Testing)

Kalau mau insert demo user "Mark Cloop" dulu untuk testing:

```sql
-- 1. Create demo user in Authentication first
-- Go to Authentication > Users > Add User
-- Email: demo@tradingtutorials.com
-- Password: demo123
-- Copy the UID after created

-- 2. Insert demo user data (replace UID)
INSERT INTO profiles (user_id, full_name, email, role, investment_amount)
VALUES (
  'DEMO_USER_UID_HERE',
  'Mark Cloop',
  'demo@tradingtutorials.com',
  'user',
  1800
)
ON CONFLICT (user_id) DO NOTHING;

-- 3. Insert demo balances
INSERT INTO balances (user_id, balance_type, currency, amount)
VALUES 
  ('DEMO_USER_UID_HERE', 'balance_1', 'USDT', 200),
  ('DEMO_USER_UID_HERE', 'balance_2', 'USDT', 400),
  ('DEMO_USER_UID_HERE', 'balance_3', 'USDT', 500),
  ('DEMO_USER_UID_HERE', 'balance_4', 'USDT', 700)
ON CONFLICT (user_id, balance_type, currency) DO NOTHING;

-- 4. Insert demo trading access
INSERT INTO trading_access (user_id, status)
VALUES ('DEMO_USER_UID_HERE', 'inactive')
ON CONFLICT (user_id) DO NOTHING;
```

---

## 🔍 Troubleshooting

### Error: "violates foreign key constraint"
→ User UID tidak ada di `auth.users` table
→ Buat user dulu di Authentication > Users

### Error: "function is_admin() does not exist"
→ Run `RESET-AND-FIX-ALL.sql` belum berhasil
→ Run ulang dari awal

### Admin tidak bisa akses data
→ UID belum masuk ke `admin_users` table
→ Run Step 4 untuk insert admin UID

### Manage Customers kosong
→ Belum ada user dengan role='user' di database
→ Insert demo user atau add customer baru

---

## 📊 Expected Results

Setelah semua steps selesai:

### Admin Dashboard:
- ✅ Statistics muncul
- ✅ Recent withdrawals (jika ada)
- ✅ Quick actions berfungsi

### Manage Customers:
- ✅ List customer muncul (demo user)
- ✅ Toggle trading status works
- ✅ Add balance works

### Add Customer:
- ✅ Form berfungsi
- ✅ Customer baru masuk database
- ✅ No RLS policy error

---

## 🆘 Masih Error?

Kalau masih ada error:

1. Screenshot error message
2. Check browser console (F12)
3. Run query ini untuk debug:

```sql
-- Debug: Check current user
SELECT auth.uid() as my_uid, auth.email() as my_email;

-- Debug: Check if I'm admin
SELECT is_admin() as am_i_admin;

-- Debug: Check admin_users table
SELECT * FROM admin_users;

-- Debug: Check profiles
SELECT user_id, email, role FROM profiles;
```

Beri tahu hasil query di atas kalau masih error!

---

**Good luck! 🚀**

