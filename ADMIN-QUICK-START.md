# 🚀 Admin System - Quick Start Guide

## ✅ What's Been Added

### 1. **Admin Panel System**
- ✅ Admin Dashboard dengan statistics
- ✅ Add Customer form (register manual)
- ✅ Role-based access control (Admin vs User)
- ✅ Auto-redirect berdasarkan role saat login

### 2. **Database Changes**
- ✅ Tambah kolom `role` di table `profiles` (admin/user)
- ✅ RLS policies untuk admin (full access)
- ✅ Table `website_settings` untuk CMS (coming soon)

### 3. **New Routes**
- `/admin/dashboard` - Admin dashboard
- `/admin/add-customer` - Form tambah customer

---

## 📝 Setup Steps (3 Minutes)

### Step 1: Update Database (Supabase)

1. Buka **Supabase Dashboard** → **SQL Editor**
2. Copy semua content dari `database-admin-setup.sql`
3. Paste dan click **RUN** ✅

### Step 2: Create Admin User

1. Di Supabase, buka **Authentication** → **Users**
2. Click **Add User** → **Create New User**
3. Isi:
   ```
   Email: admin@gmail.com
   Password: trader1122
   Auto Confirm: YES ✅
   ```
4. Click **Create User**
5. **COPY** user ID yang muncul (contoh: `abc-123-def-456`)

### Step 3: Set Admin Role

1. Kembali ke **SQL Editor**
2. Run query ini (ganti `USER_ID_HERE`):

```sql
INSERT INTO profiles (user_id, full_name, email, role, investment_amount)
VALUES (
  'USER_ID_HERE',  -- Paste admin user ID disini
  'Admin User',
  'admin@gmail.com',
  'admin',
  0.00
);
```

3. Click **RUN** ✅

### Step 4: Deploy

```bash
git add .
git commit -m "Add admin system"
git push
```

Vercel akan auto-deploy (~2 menit)

---

## 🎯 Testing Admin System

### 1. Login sebagai Admin

1. Buka website: `https://your-domain.vercel.app/login`
2. Login dengan:
   ```
   Email: admin@gmail.com
   Password: trader1122
   ```
3. ✅ Akan redirect ke `/admin/dashboard`

### 2. Add Customer

1. Di Admin Dashboard, click **"Add Customer"**
2. Isi form:
   ```
   Full Name: Test Customer
   Email: customer@test.com
   Password: test1234
   Investment Amount: 100
   ```
3. Click **"Create Customer"**
4. ✅ Customer created!

### 3. Test Customer Login

1. Logout dari admin
2. Login dengan:
   ```
   Email: customer@test.com
   Password: test1234
   ```
3. ✅ Akan redirect ke `/dashboard` (user dashboard)

---

## 🔐 Admin Credentials

```
Email: admin@gmail.com
Password: trader1122
```

⚠️ **PENTING**: Ganti password setelah first login!

---

## 📊 Admin Features

### Current Features:
- ✅ View statistics (users, withdrawals, traders)
- ✅ Add new customers (manual registration)
- ✅ Auto-create profile + balances + trading access

### Coming Soon:
- [ ] View all customers (table dengan search)
- [ ] Edit customer data
- [ ] Delete customers
- [ ] Approve/reject withdrawals
- [ ] Website settings (upload logo, images)
- [ ] Export data to CSV
- [ ] Email notifications

---

## 🛡️ Security Features

### Role-Based Access
- **Admin**: Full access (admin panel + user features)
- **User**: User dashboard only

### Auto-Redirect
- Admin login → `/admin/dashboard`
- User login → `/dashboard`
- Non-admin try access `/admin/*` → redirect to `/dashboard`

### Row Level Security
- Admin can view/edit ALL data
- Users can only view/edit their OWN data

---

## 📁 New Files

```
src/pages/admin/
├── AdminDashboard.tsx    # Admin dashboard dengan stats
└── AddCustomer.tsx       # Form register customer

database-admin-setup.sql  # Database migration script
ADMIN-SETUP-GUIDE.md     # Detailed documentation
ADMIN-QUICK-START.md     # This file
```

---

## 🐛 Troubleshooting

### Issue: "Permission denied" saat add customer
**Fix**: Pastikan admin role sudah di-set di database
```sql
SELECT role FROM profiles WHERE email = 'admin@gmail.com';
-- Should return: 'admin'
```

### Issue: Admin redirect ke /dashboard instead of /admin/dashboard
**Fix**: 
1. Clear browser cache
2. Logout dan login lagi
3. Check role di database (query di atas)

### Issue: Can't create user (supabase.auth.admin not available)
**Fix**: 
- Supabase `admin.createUser()` perlu Service Role Key
- Untuk production, sebaiknya buat server endpoint
- Untuk demo, bisa manual create di Supabase Dashboard

---

## 📞 Next Steps

1. ✅ Test admin login
2. ✅ Test add customer
3. ✅ Test customer login
4. 📝 Implement "Manage Customers" page
5. 🎨 Implement "Website Settings" CMS
6. 📊 Add withdrawal approval system

---

## 🎉 Done!

Admin system sudah ready! User tidak bisa self-register, semua customer harus ditambahkan oleh admin.

**Flow:**
```
Admin → Login → Admin Dashboard → Add Customer
                                        ↓
Customer → Terima credentials → Login → User Dashboard
```

Enjoy! 🚀
