# 📋 Panduan Migrasi Database Supabase

## Step 1: Setup Database Baru

1. **Buka Supabase Dashboard baru**
   - https://supabase.com/dashboard
   - Pilih project baru

2. **Run SQL Migration**
   - Buka **SQL Editor**
   - Copy-paste isi file: `supabase-migration-complete.sql`
   - Klik **Run** (Ctrl+Enter)
   - ✅ Tunggu sampai selesai (semua table, policies, indexes akan dibuat)

## Step 2: Insert Data Admin & Demo User

1. **Pastikan Admin & Demo user sudah dibuat di Auth**
   - Buka **Authentication** > **Users**
   - Pastikan user `admin@tradingtutorials.com` sudah ada
   - Pastikan user `demo@tradingtutorials.com` sudah ada

2. **Insert Initial Data**
   - Buka **SQL Editor**
   - Copy-paste isi file: `insert-initial-data.sql`
   - Klik **Run**
   - ✅ Data admin akan ter-insert dengan UID: `cb26928a-6e50-4a5c-ad1d-c5c76caa98ad`

3. **Jika punya demo user, update SQL:**
   - Buka file `insert-initial-data.sql`
   - Ganti `'DEMO_USER_ID'` dengan UID demo user Anda
   - Uncomment (hapus `/*` dan `*/`)
   - Run lagi

## Step 3: Migrasi Data Customer dari Database Lama

### Option A: Manual Export/Import (Recommended)

1. **Export dari database lama:**
   ```sql
   -- Di Supabase lama, run query ini di SQL Editor:
   
   -- Export profiles
   SELECT * FROM profiles WHERE role = 'user';
   
   -- Export balances
   SELECT * FROM balances;
   
   -- Export trading_access
   SELECT * FROM trading_access;
   
   -- Export withdrawals
   SELECT * FROM withdrawals;
   ```

2. **Copy hasil query** dan save sebagai CSV

3. **Import ke database baru:**
   - Buka Supabase baru > **Table Editor**
   - Pilih table (profiles, balances, dll)
   - Klik **Insert** > **Import data**
   - Upload CSV file

### Option B: Script SQL (Advanced)

Jika punya akses langsung ke database lama, bisa export SQL:

```sql
-- Export customers (bukan admin)
COPY (
  SELECT * FROM profiles 
  WHERE role = 'user'
) TO '/tmp/profiles.csv' WITH CSV HEADER;

COPY (
  SELECT * FROM balances
) TO '/tmp/balances.csv' WITH CSV HEADER;

-- Lalu import di database baru
```

## Step 4: Verifikasi Data

Jalankan query ini di SQL Editor baru:

```sql
-- Total users
SELECT COUNT(*) as total_users FROM profiles;

-- Total admin
SELECT COUNT(*) as total_admin FROM profiles WHERE role = 'admin';

-- Total customers
SELECT COUNT(*) as total_customers FROM profiles WHERE role = 'user';

-- Check admin
SELECT * FROM profiles WHERE user_id = 'cb26928a-6e50-4a5c-ad1d-c5c76caa98ad';

-- Check balances
SELECT 
  p.full_name,
  p.email,
  SUM(b.amount) as total_balance
FROM profiles p
LEFT JOIN balances b ON p.user_id = b.user_id
GROUP BY p.user_id, p.full_name, p.email;
```

## Step 5: Update .env File

Pastikan file `.env` sudah update:

```env
VITE_SUPABASE_URL=https://YOUR-NEW-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-new-anon-key
```

## Step 6: Test Aplikasi

```bash
# Install dependencies (jika belum)
npm install

# Run development
npm run dev

# Test:
# 1. Login sebagai admin: admin@tradingtutorials.com
# 2. Login sebagai demo: demo@tradingtutorials.com
# 3. Cek Dashboard, Profile, Trading Access
# 4. Test Add Customer (admin only)
```

## Step 7: Deploy

```bash
# Push to GitHub
git add .
git commit -m "Migrate to new Supabase"
git push origin main

# Deploy to Vercel
vercel --prod

# Atau jika GitHub Actions auto-deploy:
# Just push and wait
```

## ⚠️ Important Notes

1. **API Keys Aman**: Jangan commit `.env` ke GitHub!
2. **RLS Active**: Semua table sudah protected dengan Row Level Security
3. **Backup**: Selalu backup database lama sebelum migrasi
4. **Test**: Test semua fitur setelah migrasi (login, dashboard, trading, withdrawal)

## 🆘 Troubleshooting

### Error: "relation does not exist"
- ✅ Pastikan sudah run `supabase-migration-complete.sql`

### Error: "permission denied"
- ✅ Pastikan RLS policies sudah dibuat
- ✅ Cek role user (admin/user)

### Data tidak muncul
- ✅ Cek apakah data sudah ter-insert dengan query verification
- ✅ Cek browser console untuk error

### Login tidak bisa
- ✅ Pastikan user sudah dibuat di **Authentication** > **Users**
- ✅ Cek email konfirmasi (jika pakai email confirmation)

## 📞 Need Help?

Jika ada error, cek:
1. Browser console (F12)
2. Supabase logs (Dashboard > Logs)
3. Network tab untuk melihat API request

---

**Good luck with migration! 🚀**
