# Quick Start Guide

Panduan cepat untuk menjalankan Trading Tutorials aplikasi.

## ✅ Prerequisites Checklist

- [x] Node.js 18+ sudah terinstall
- [x] npm sudah terinstall
- [x] Akun Supabase sudah dibuat
- [x] File `.env` sudah berisi API keys dari Supabase

## 🚀 Langkah Setup

### 1. Install Dependencies

```bash
cd trading-tutorials
npm install
```

### 2. Setup Database di Supabase

#### a. Buka Supabase Dashboard
- Login ke https://supabase.com
- Pilih project yang sudah dibuat
- Klik "SQL Editor" di sidebar

#### b. Jalankan Database Setup Script
- Copy semua isi dari file `database-setup.sql`
- Paste ke SQL Editor
- Klik "Run" atau tekan `Ctrl + Enter`

Script ini akan:
- Create 4 tables: `profiles`, `balances`, `trading_access`, `withdrawals`
- Enable Row Level Security (RLS)
- Create RLS policies untuk user isolation
- Create indexes untuk performa
- Create triggers untuk auto-update timestamps

#### c. Verifikasi Tables
Jalankan query ini untuk cek apakah tables sudah dibuat:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'balances', 'trading_access', 'withdrawals');
```

Harusnya return 4 rows.

### 3. Create Test User

#### a. Buka Authentication Tab
- Di Supabase Dashboard, klik "Authentication" di sidebar
- Klik "Add user" → "Create new user"

#### b. Isi Data User
```
Email: test@example.com
Password: Test123456!
```

Atau gunakan email dan password sesuai keinginan.

#### c. Copy User UUID
Setelah user dibuat, copy UUID user (contoh: `a1b2c3d4-e5f6-...`)

### 4. Seed Data untuk Test User

Di SQL Editor, jalankan script ini (ganti `YOUR_USER_UUID_HERE` dengan UUID yang dicopy):

```sql
-- Seed profile
INSERT INTO profiles (user_id, full_name, email, address, phone_number, country, investment_amount)
VALUES 
  ('YOUR_USER_UUID_HERE', 'Mark Cloop', 'test@example.com', 'California', '+15553633566', 'America', 100.00);

-- Seed balances
INSERT INTO balances (user_id, balance_type, amount)
VALUES 
  ('YOUR_USER_UUID_HERE', 'balance_1', 200.00),
  ('YOUR_USER_UUID_HERE', 'balance_2', 400.00),
  ('YOUR_USER_UUID_HERE', 'balance_3', 500.00),
  ('YOUR_USER_UUID_HERE', 'balance_4', 700.00);

-- Seed trading access
INSERT INTO trading_access (user_id, status)
VALUES 
  ('YOUR_USER_UUID_HERE', 'inactive');
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di: `http://localhost:3000`

### 6. Login ke Aplikasi

- Buka browser: `http://localhost:3000`
- Akan redirect otomatis ke `/login`
- Login dengan credentials yang dibuat tadi:
  - Email: `test@example.com`
  - Password: `Test123456!`

## 🎯 Test Workflow

Setelah login berhasil, test workflow berikut:

### 1. Dashboard (Home)
✅ Tampil nama user: "Mark Cloop"  
✅ Tampil balance card: Balance 1 (USDT 200)  
✅ Tampil balance card: Balance 2 (USDT 400)  
✅ Total balance: USDT 1800.00  
✅ Trading status: "Inactive Trading"

### 2. Hamburger Menu
✅ Klik icon hamburger (≡) di kanan atas  
✅ Menu slide dari kanan  
✅ Tampil menu items:
- My Profile
- Market Global
- Trading Access
- Withdrawal
- Logout

### 3. My Profile
✅ Klik "My Profile" dari menu  
✅ Tampil avatar placeholder  
✅ Tampil Full Name: Mark Cloop  
✅ Tampil Address: California  
✅ Tampil Phone: +15553633566  
✅ Tampil Email: test@example.com  
✅ Tampil Country: America  
✅ Tampil Investment Amount: USDT 100.00

### 4. Market Global
✅ Klik "Market Global" dari menu  
✅ Tampil list trading pairs (BTC/USDT, ETH/USDT, etc.)  
✅ Tampil harga dan perubahan (warna hijau/merah)

### 5. Trading Access
✅ Klik "Trading Access" dari menu  
✅ Tampil total balance: USDT 1,800.00  
✅ Tampil 4 balance cards  
✅ Tampil button "TRADING ACCESS"

### 6. Withdrawal
✅ Klik "Withdrawal" dari menu  
✅ Tampil ilustrasi wallet  
✅ Tampil nama user  
✅ Tampil available balance: USDT 1,800.00  
✅ Klik button "Withdrawal"

#### Test Withdrawal Form:
✅ Isi Amount: 100  
✅ Isi Wallet Address: TXYz1234567890abcdefghijk  
✅ Pilih Network: TRC20  
✅ Klik "Submit Withdrawal"  
✅ Success message muncul  
✅ Status: Pending

#### Test Validation:
❌ Amount = 0 → Error: "Amount must be positive"  
❌ Amount = 2000 (lebih dari balance) → Error: "Amount exceeds available balance"  
❌ Wallet Address kosong → Error: "Wallet address must be at least 10 characters"  
❌ Network tidak dipilih → Error: "Network is required"

### 7. Logout
✅ Klik "Logout" dari menu  
✅ Redirect ke `/login`  
✅ Session cleared  
✅ Tidak bisa akses protected routes

## 🔍 Troubleshooting

### Problem: "Missing Supabase environment variables"
**Solution**: 
- Pastikan file `.env` ada di root folder `trading-tutorials/`
- Pastikan isi:
  ```env
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
  ```
- Restart dev server: `Ctrl + C` lalu `npm run dev` lagi

### Problem: Login failed "Invalid email or password"
**Solution**:
- Cek credentials di Supabase Dashboard → Authentication → Users
- Pastikan email dan password sama
- Pastikan user sudah di-confirm (kalau email confirmation diaktifkan)

### Problem: Dashboard kosong / no data
**Solution**:
- Cek apakah seed data sudah dijalankan
- Cek user UUID sudah benar
- Query manual di SQL Editor:
  ```sql
  SELECT * FROM profiles WHERE user_id = 'YOUR_USER_UUID';
  SELECT * FROM balances WHERE user_id = 'YOUR_USER_UUID';
  ```

### Problem: "Failed to load dashboard data"
**Solution**:
- Cek RLS policies sudah dibuat
- Verifikasi:
  ```sql
  SELECT * FROM pg_policies WHERE schemaname = 'public';
  ```
- Re-run bagian RLS dari `database-setup.sql`

### Problem: Port 3000 already in use
**Solution**:
- Edit `vite.config.ts`, ganti port:
  ```typescript
  server: {
    port: 3001, // atau port lain yang available
    host: true
  }
  ```
- Atau kill process yang pakai port 3000

## 📱 Mobile Testing

Untuk test di mobile device:

1. Pastikan mobile dan laptop di network yang sama
2. Cek IP laptop: `ipconfig` (Windows) atau `ifconfig` (Mac/Linux)
3. Di mobile browser, buka: `http://192.168.x.x:3000` (ganti dengan IP laptop)

## 🏗 Build untuk Production

```bash
npm run build
```

Output ada di folder `dist/`

Preview production build:
```bash
npm run preview
```

## 🚀 Deploy ke Vercel

### Option 1: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 2: Via Vercel Dashboard

1. Push code ke GitHub
2. Login ke https://vercel.com
3. Import GitHub repository
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
5. Deploy

## ✅ Final Checklist

- [ ] npm install berhasil
- [ ] Database tables created (4 tables)
- [ ] RLS enabled dan policies created
- [ ] Test user created di Supabase Auth
- [ ] Seed data inserted dengan user UUID yang benar
- [ ] `npm run dev` berjalan tanpa error
- [ ] Login berhasil dengan test credentials
- [ ] Dashboard tampil dengan data yang benar
- [ ] Semua menu accessible (Profile, Market, Trading Access, Withdrawal)
- [ ] Withdrawal form berfungsi dengan validation
- [ ] Logout berhasil dan redirect ke login

## 🎉 Selesai!

Aplikasi Trading Tutorials sudah siap digunakan! 

Untuk informasi lebih detail tentang security, architecture, dan deployment, baca:
- `README.md` - Complete documentation
- `SECURITY.md` - Security measures dan best practices
- `database-setup.sql` - Database schema dan RLS policies
