================================================================================
🚀 SIMPLE FIX - 4 STEPS ONLY!
================================================================================

LANGKAH 1: Drop All Policies
  → Open Supabase SQL Editor
  → Copy & paste isi file: 1-DROP-ALL-POLICIES.sql
  → Run (Ctrl+Enter)
  → ✅ Result: "ALL POLICIES DROPPED!"

LANGKAH 2: Create New Policies
  → Copy & paste isi file: 2-CREATE-POLICIES.sql
  → Run
  → ✅ Result: "ALL POLICIES CREATED!"

LANGKAH 3: Find Your Admin UID
  → Copy & paste isi file: QUICK-FIX-ADMIN.sql
  → Look at STEP 1 result - find your admin email
  → Copy the UID (long text like: cb26928a-6e50-4a5c-ad1d-c5c76caa98ad)

LANGKAH 4: Edit & Run Admin Insert
  → In QUICK-FIX-ADMIN.sql, find line:
    INSERT INTO admin_users (user_id) VALUES ('cb26928a-...')
  → REPLACE the UID with YOUR UID from step 3
  → Run the INSERT query
  → ✅ Result: Should show your email in admin_users table

================================================================================
VERIFY:
  → Logout from aplikasi
  → Login lagi dengan admin email
  → Go to /admin/customers (should see customer list)
  → Go to /admin/add-customer (should work without error)
================================================================================

TIPS:
  - Kalau tidak ada user di auth.users, buat dulu user di Supabase:
    Dashboard > Authentication > Users > Add User
  - Email admin: admin@tradingtutorials.com (atau email Anda)
  - Password: min 6 karakter
  - Setelah buat user, copy UID nya dan insert ke admin_users

================================================================================
