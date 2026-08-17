================================================================================
🔧 FIX ADMIN FEATURES - QUICK GUIDE
================================================================================

MASALAH:
  ❌ Manage Customers tidak bisa load data
  ❌ Add Customer error "new row violates row-level security policy"
  ❌ Admin features tidak berfungsi

SOLUSI:
  ✅ Run 1 file SQL untuk fix semua masalah RLS policy

================================================================================
LANGKAH-LANGKAH (HANYA 5 MENIT!)
================================================================================

STEP 1: Buka Supabase SQL Editor
  → Go to: https://fcgfnuydswfxwqrqqlup.supabase.co
  → Click "SQL Editor" di sidebar
  → Click "New Query"

STEP 2: Run RESET-AND-FIX-ALL.sql
  → Buka file: RESET-AND-FIX-ALL.sql
  → Copy SEMUA isi file (Ctrl+A, Ctrl+C)
  → Paste ke SQL Editor
  → Click "Run" (Ctrl+Enter)
  → Tunggu sampai selesai (lihat "ALL POLICIES FIXED!")

STEP 3: Logout & Login Lagi
  → Logout dari aplikasi
  → Clear browser cache (Ctrl+Shift+Del)
  → Login lagi dengan admin email

STEP 4: Test Features
  → Go to /admin/customers (harusnya muncul customer list)
  → Go to /admin/add-customer (harusnya bisa add tanpa error)

================================================================================
VERIFIKASI (OPTIONAL)
================================================================================

Kalau mau verify SQL berhasil, run TEST-AFTER-FIX.sql:
  → Copy TEST-AFTER-FIX.sql
  → Paste ke SQL Editor
  → Run satu-persatu query
  → Semua harusnya return data tanpa error

================================================================================
FILE-FILE PENTING
================================================================================

✅ RESET-AND-FIX-ALL.sql
   → File utama untuk fix semua RLS policy issues
   → Run SEKALI aja
   → Hapus semua policy lama, buat yang baru

✅ FIX-ADMIN-GUIDE.md
   → Panduan lengkap dengan penjelasan detail
   → Troubleshooting guide
   → Baca kalau masih ada error

✅ TEST-AFTER-FIX.sql
   → Test queries untuk verify fix berhasil
   → Optional, untuk debugging

❌ fix-rls-policies.sql (DEPRECATED)
   → Jangan pakai lagi
   → Sudah diganti dengan RESET-AND-FIX-ALL.sql

❌ fix-add-customer.sql (DEPRECATED)
   → Jangan pakai lagi
   → Sudah include di RESET-AND-FIX-ALL.sql

================================================================================
APA YANG BERUBAH?
================================================================================

SEBELUM:
  - RLS policy cek profiles dari dalam profiles (infinite recursion)
  - Trigger auto-create profile (conflict dengan admin insert)
  - Policy terlalu kompleks dan saling bertabrakan

SETELAH:
  - Admin whitelist di table admin_users (separate, no recursion)
  - Function is_admin() untuk cek admin (simple)
  - Trigger di-disable (admin control manual)
  - Policy simple: "user sendiri ATAU admin"

================================================================================
TROUBLESHOOTING
================================================================================

ERROR: "function is_admin() does not exist"
  → Run RESET-AND-FIX-ALL.sql lagi

ERROR: "permission denied for table admin_users"
  → Run: ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

ERROR: Admin masih tidak bisa akses
  1. Check UID admin:
     SELECT auth.uid(), email FROM auth.users WHERE email = 'admin@...';
  2. Insert ke admin_users:
     INSERT INTO admin_users (user_id) VALUES ('YOUR_UID');
  3. Logout & login lagi

ERROR: Customer tidak muncul
  → Run insert-initial-data.sql untuk insert demo user

================================================================================
AFTER FIX - EXPECTED RESULTS
================================================================================

✅ Manage Customers:
   - Muncul list customer (demo user "Mark Cloop")
   - Bisa toggle Trading Status
   - Bisa Add Balance

✅ Add Customer:
   - Form berfungsi normal
   - Customer baru masuk database
   - No error "row-level security policy"

✅ Admin Dashboard:
   - Statistics muncul (total customers, balance, etc)
   - Recent withdrawals muncul
   - Quick actions berfungsi

================================================================================
NEED HELP?
================================================================================

Kalau masih error setelah run RESET-AND-FIX-ALL.sql:
  1. Screenshot error message
  2. Check console browser (F12)
  3. Run TEST-AFTER-FIX.sql untuk check mana yang gagal
  4. Baca FIX-ADMIN-GUIDE.md untuk troubleshooting detail

================================================================================
GOOD LUCK! 🚀
================================================================================
