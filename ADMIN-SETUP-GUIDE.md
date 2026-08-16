# 🔐 Admin System Setup Guide

## Overview
Trading Tutorials sekarang memiliki **Admin Panel** untuk:
- ✅ Tambah customer/peserta baru (register manual)
- ✅ Lihat semua data user
- ✅ Manage website settings (CMS)
- ✅ View statistics dan analytics

## 📋 Setup Instructions

### Step 1: Run Database Migration

1. Buka **Supabase Dashboard** → SQL Editor
2. Run script `database-admin-setup.sql`:
   - Copy semua content dari file
   - Paste ke SQL Editor
   - Click **Run**

### Step 2: Create Admin User

1. Di Supabase Dashboard, buka **Authentication** → **Users**
2. Click **Add User** → **Create New User**
3. Isi data:
   - **Email**: `admin@gmail.com`
   - **Password**: `trader1122`
   - **Auto Confirm User**: ✅ YES
4. Click **Create User**
5. **Copy User ID** yang muncul

### Step 3: Set Admin Role

1. Buka **SQL Editor** lagi
2. Run query ini (ganti `USER_ID_HERE` dengan ID yang di-copy):

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

3. Click **Run**

### Step 4: Verify Admin Access

1. Build dan deploy aplikasi:
   ```bash
   npm run build
   git add .
   git commit -m "Add admin system"
   git push
   ```

2. Login dengan:
   - **Email**: `admin@gmail.com`
   - **Password**: `trader1122`

3. Anda akan otomatis redirect ke `/admin/dashboard` ✅

## 🎯 Admin Features

### 1. Admin Dashboard (`/admin/dashboard`)
- View statistics (total users, withdrawals, active traders)
- Quick access ke semua admin features
- **URL**: `https://your-domain.vercel.app/admin/dashboard`

### 2. Add Customer (`/admin/add-customer`)
- Form untuk register customer baru
- Fields:
  - Full Name *
  - Email *
  - Password * (min 6 characters)
  - Phone Number
  - Address
  - Country
  - Initial Investment Amount *
- **Auto-create**: Profile, Balances (4x), Trading Access
- **URL**: `https://your-domain.vercel.app/admin/add-customer`

### 3. Manage Customers (`/admin/customers`) - Coming Soon
- View all customers
- Edit customer data
- Delete customers
- Search and filter

### 4. Website Settings (`/admin/settings`) - Coming Soon
- Upload logo
- Change hero image
- Update contact info
- CMS untuk content

## 🔒 Security Features

### Role-Based Access Control (RBAC)
- **Admin role**: Full access ke admin panel + semua fitur user
- **User role**: Hanya access user dashboard

### Row Level Security (RLS)
- Admin bisa view/edit semua data
- User hanya bisa view/edit data mereka sendiri
- Policies sudah di-setup di database

### Admin-Only Routes
- `/admin/*` routes hanya bisa diakses oleh admin
- Auto-redirect ke `/dashboard` jika non-admin coba akses

## 📝 Admin Credentials

```
Email: admin@gmail.com
Password: trader1122
```

**⚠️ PENTING**: Ganti password setelah first login!

## 🚀 Usage Flow

### Untuk Admin:
1. Login dengan `admin@gmail.com`
2. Redirect ke Admin Dashboard
3. Click "Add Customer" untuk register peserta baru
4. Isi form dan submit
5. Customer bisa langsung login dengan email/password yang dibuat

### Untuk Customer/User:
1. Admin create account untuk mereka
2. Mereka terima email/password
3. Login di halaman login biasa
4. Access user dashboard (trading, withdrawal, dll)

## 🛠 Troubleshooting

### Issue: Admin tidak bisa login
**Solution**: 
- Pastikan script `database-admin-setup.sql` sudah di-run
- Verify role di profiles table: `SELECT * FROM profiles WHERE email = 'admin@gmail.com';`
- Role harus `'admin'`, bukan `'user'`

### Issue: 404 saat refresh admin page
**Solution**:
- Pastikan file `vercel.json` sudah di-commit dan push
- Vercel harus configured untuk SPA routing

### Issue: Permission denied saat add customer
**Solution**:
- Pastikan RLS policies untuk admin sudah di-create
- Check dengan query: `SELECT * FROM pg_policies WHERE tablename = 'profiles';`

## 📁 File Structure

```
src/
├── pages/
│   ├── admin/
│   │   ├── AdminDashboard.tsx   # Admin dashboard
│   │   ├── AddCustomer.tsx      # Form tambah customer
│   │   ├── Customers.tsx        # (Coming soon)
│   │   └── Settings.tsx         # (Coming soon)
│   ├── Dashboard.tsx            # User dashboard
│   └── Login.tsx                # Login (auto-detect admin)
├── routes/
│   └── ProtectedRoute.tsx       # Auth guard
└── App.tsx                      # Routing config
```

## 🎨 Next Steps (Future Features)

- [ ] Customer management page (view all, edit, delete)
- [ ] Website settings CMS (logo, images, text)
- [ ] Withdrawal approval system
- [ ] Trading status management
- [ ] Analytics dashboard
- [ ] Export customer data
- [ ] Email notifications
- [ ] Audit logs

## 📞 Support

Jika ada masalah saat setup, check:
1. Supabase logs di Dashboard → Logs
2. Browser console untuk errors
3. Network tab untuk API responses

---

**Setup completed!** Admin system siap digunakan! 🎉
