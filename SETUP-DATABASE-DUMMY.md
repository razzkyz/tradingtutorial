# Setup Database & Dummy Login - Step by Step

Ikuti langkah ini untuk setup database Supabase lengkap dengan dummy login.

---

## 📋 Yang Akan Dibuat

**Dummy User:**
- Email: `demo@tradingtutorials.com`
- Password: `Demo123456!`

**Dummy Data:**
- Profile lengkap (Mark Cloop)
- 4 Balances (Total: USDT 1,800)
- Trading Access (Inactive)

---

## 🚀 LANGKAH 1: Setup Tables & RLS (3 menit)

### 1.1 Buka Supabase Dashboard

1. Login ke https://supabase.com
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri

### 1.2 Run Script Setup

1. Buka file `supabase-complete-setup.sql`
2. Copy **SEMUA ISI** file tersebut
3. Paste ke SQL Editor di Supabase
4. Klik **Run** (atau tekan `Ctrl + Enter`)
5. Tunggu sampai selesai (sekitar 5-10 detik)

✅ **Sukses jika muncul:** "Success. No rows returned"

### 1.3 Verifikasi Tables

Run query ini di SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'balances', 'trading_access', 'withdrawals');
```

✅ **Harus return 4 rows** (4 tables)

---

## 🚀 LANGKAH 2: Create Dummy User (2 menit)

### 2.1 Buka Authentication Tab

1. Di Supabase Dashboard, klik **Authentication** di sidebar
2. Klik tab **Users**
3. Klik tombol **Add user** (pojok kanan atas)
4. Pilih **Create new user**

### 2.2 Isi Form User

```
Email Address: demo@tradingtutorials.com
Password: Demo123456!
Auto Confirm User: ✅ (centang ini!)
```

> ⚠️ **PENTING:** Centang "Auto Confirm User" agar bisa langsung login!

5. Klik **Create user**

### 2.3 Copy User UUID

1. Setelah user dibuat, akan muncul di list
2. Klik pada user `demo@tradingtutorials.com`
3. Lihat bagian **UID** atau **ID**
4. **COPY** UUID tersebut (contoh: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

📋 **Simpan UUID ini**, akan dipakai di langkah berikutnya.

---

## 🚀 LANGKAH 3: Insert Dummy Data (2 menit)

### 3.1 Kembali ke SQL Editor

1. Klik **SQL Editor** di sidebar

### 3.2 Run Script Dummy Data

**GANTI** `YOUR_USER_UUID_HERE` dengan UUID yang di-copy tadi!

```sql
-- ============================================
-- INSERT DUMMY DATA
-- ============================================
-- GANTI YOUR_USER_UUID_HERE dengan UUID user Anda!

-- Insert Profile
INSERT INTO profiles (user_id, full_name, email, address, phone_number, country, investment_amount)
VALUES 
  (
    'YOUR_USER_UUID_HERE',  -- 👈 GANTI INI!
    'Mark Cloop',
    'demo@tradingtutorials.com',
    'California, United States',
    '+15553633566',
    'America',
    100.00
  );

-- Insert Balances (4 balances)
INSERT INTO balances (user_id, balance_type, amount)
VALUES 
  ('YOUR_USER_UUID_HERE', 'balance_1', 200.00),   -- 👈 GANTI INI!
  ('YOUR_USER_UUID_HERE', 'balance_2', 400.00),   -- 👈 GANTI INI!
  ('YOUR_USER_UUID_HERE', 'balance_3', 500.00),   -- 👈 GANTI INI!
  ('YOUR_USER_UUID_HERE', 'balance_4', 700.00);   -- 👈 GANTI INI!
  
-- Total balance: 200 + 400 + 500 + 700 = 1,800 USDT

-- Insert Trading Access
INSERT INTO trading_access (user_id, status)
VALUES 
  ('YOUR_USER_UUID_HERE', 'inactive');  -- 👈 GANTI INI!

-- ============================================
-- DUMMY DATA COMPLETE!
-- ============================================
```

3. **Klik Run**

✅ **Sukses jika muncul:** "Success. No rows returned" atau "3 rows affected"

### 3.3 Verifikasi Data

Run query ini untuk cek data sudah masuk:

```sql
-- Ganti YOUR_USER_UUID_HERE dengan UUID Anda
SELECT 'Profile' as type, COUNT(*) as count FROM profiles WHERE user_id = 'YOUR_USER_UUID_HERE'
UNION ALL
SELECT 'Balances', COUNT(*) FROM balances WHERE user_id = 'YOUR_USER_UUID_HERE'
UNION ALL
SELECT 'Trading', COUNT(*) FROM trading_access WHERE user_id = 'YOUR_USER_UUID_HERE';
```

✅ **Harus return:**
```
Profile  | 1
Balances | 4
Trading  | 1
```

---

## 🚀 LANGKAH 4: Test Login (1 menit)

### 4.1 Jalankan Aplikasi

Di terminal (di folder `trading-tutorials`):

```bash
npm run dev
```

### 4.2 Buka Browser

Buka: http://localhost:3000

### 4.3 Login dengan Dummy Credentials

```
Email: demo@tradingtutorials.com
Password: Demo123456!
```

Klik **Login**

### 4.4 Verifikasi Dashboard

✅ **Harus muncul:**
- Nama: Mark Cloop
- Balance 1: USDT 200.00
- Balance 2: USDT 400.00
- Total di Balance Card: USDT 1,800.00
- Trading Status: Inactive Trading

---

## 🎯 Test Semua Fitur

### Test 1: My Profile
1. Klik hamburger menu (≡)
2. Klik **My Profile**
3. ✅ Harus tampil: Mark Cloop, California, +15553633566, etc.

### Test 2: Market Global
1. Klik hamburger menu
2. Klik **Market Global**
3. ✅ Harus tampil: List trading pairs (BTC/USDT, ETH/USDT, etc.)

### Test 3: Trading Access
1. Klik hamburger menu
2. Klik **Trading Access**
3. ✅ Harus tampil: Total USDT 1,800.00 dan 4 balance cards

### Test 4: Withdrawal
1. Klik hamburger menu
2. Klik **Withdrawal**
3. ✅ Harus tampil: Mark Cloop, USDT 1,800.00
4. Klik **Withdrawal** button
5. Isi form:
   - Amount: `100`
   - Wallet: `TXYz1234567890abcdefghijk`
   - Network: `TRC20`
6. Klik **Submit Withdrawal**
7. ✅ Harus muncul: Success message

### Test 5: Logout
1. Klik hamburger menu
2. Klik **Logout**
3. ✅ Harus redirect ke login page

---

## 🔧 Troubleshooting

### Problem: "Auto Confirm User" tidak ada
**Solution:** 
- Buat user manual dulu
- Lalu ke SQL Editor, run:
  ```sql
  UPDATE auth.users 
  SET email_confirmed_at = NOW() 
  WHERE email = 'demo@tradingtutorials.com';
  ```

### Problem: Login failed "Invalid email or password"
**Solution:**
1. Cek user ada di Authentication → Users
2. Pastikan email: `demo@tradingtutorials.com`
3. Reset password via Supabase Dashboard jika perlu

### Problem: Dashboard kosong / no data
**Solution:**
1. Cek UUID sudah diganti di INSERT script
2. Verifikasi data dengan query di langkah 3.3
3. Jika kosong, run ulang INSERT script dengan UUID yang benar

### Problem: "relation does not exist"
**Solution:**
1. Tables belum dibuat
2. Run ulang `supabase-complete-setup.sql`

### Problem: RLS blocking queries
**Solution:**
1. Verifikasi policies dengan:
   ```sql
   SELECT * FROM pg_policies WHERE schemaname = 'public';
   ```
2. Harus ada policies untuk SELECT, INSERT, UPDATE

---

## 📊 Summary Dummy Data

**User:**
- Email: `demo@tradingtutorials.com`
- Password: `Demo123456!`
- Name: Mark Cloop

**Balances:**
- Balance 1: USDT 200.00
- Balance 2: USDT 400.00
- Balance 3: USDT 500.00
- Balance 4: USDT 700.00
- **Total: USDT 1,800.00**

**Profile:**
- Address: California, United States
- Phone: +15553633566
- Country: America
- Investment: USDT 100.00

**Trading Status:** Inactive

---

## ✅ Checklist Final

Setup complete jika semua ini ✅:

- [ ] Tables created (4 tables)
- [ ] RLS enabled on all tables
- [ ] Policies created
- [ ] Dummy user created
- [ ] User UUID copied
- [ ] Dummy data inserted
- [ ] Login berhasil
- [ ] Dashboard tampil data yang benar
- [ ] My Profile accessible
- [ ] Market Global accessible
- [ ] Trading Access accessible
- [ ] Withdrawal form working
- [ ] Logout working

---

## 🎉 Selesai!

Database Supabase sudah ready dengan dummy data!

Sekarang Anda bisa:
- ✅ Login dengan `demo@tradingtutorials.com`
- ✅ Test semua fitur aplikasi
- ✅ Demo ke client/team
- ✅ Deploy ke Vercel

**Next:** Build production version dengan `npm run build`
