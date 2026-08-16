# 🔧 Fix Admin Login & Redirect

## Problem
- Login dengan `admin@gmail.com` redirect ke `/dashboard` (user)
- Harusnya redirect ke `/admin/dashboard` (admin)

---

## Root Cause Analysis

Kemungkinan penyebab:
1. ❌ Role di database masih `'user'`, bukan `'admin'`
2. ❌ Build lama belum di-deploy
3. ❌ Browser cache

---

## ✅ SOLUTION

### **Step 1: Verify Role di Database**

1. Buka **Supabase Dashboard** → **SQL Editor**
2. Run query ini:

```sql
SELECT email, role FROM profiles WHERE email = 'admin@gmail.com';
```

**Expected:** `role = 'admin'`

**If role is 'user' or NULL:**

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@gmail.com';
```

3. Verify lagi:

```sql
SELECT email, role FROM profiles WHERE email = 'admin@gmail.com';
```

Harus return: **role = 'admin'** ✅

---

### **Step 2: Clear Browser Cache**

1. **Chrome/Edge**: `Ctrl + Shift + Delete`
2. Pilih "Cached images and files"
3. Click "Clear data"

Atau:

**Hard Refresh:**
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

---

### **Step 3: Logout & Login**

1. Logout dari aplikasi
2. Close browser
3. Buka browser lagi
4. Login dengan:
   ```
   Email: admin@gmail.com
   Password: trader1122
   ```

5. ✅ Harus redirect ke `/admin/dashboard`

---

### **Step 4: Manual Test URL**

Setelah login, manually navigate:

```
https://your-domain.vercel.app/admin/dashboard
```

**Expected Behavior:**
- Admin user → See admin dashboard ✅
- Regular user → Redirect to `/dashboard`

---

### **Step 5: Check Deployment**

Pastikan build terbaru sudah di-deploy:

```bash
# Local
git status
git log --oneline -5

# Check last commit has admin changes
# Should see: "Add admin system" or similar
```

**If not deployed yet:**

```bash
git add .
git commit -m "Fix admin login redirect"
git push
```

Wait ~2 minutes for Vercel deployment.

---

## 🐛 Debug Steps

### Check 1: Inspect Console

1. Login sebagai admin
2. Open browser console (F12)
3. Check for errors
4. Look for:
   ```
   profile?.role === 'admin'
   ```

### Check 2: Network Tab

1. Open Network tab (F12)
2. Login
3. Look for request to `/profiles?select=role&user_id=...`
4. Check response: should have `role: "admin"`

### Check 3: Database Query

Run in Supabase SQL Editor:

```sql
-- Get admin user with role
SELECT 
  p.email,
  p.role,
  au.id as auth_user_id
FROM profiles p
LEFT JOIN auth.users au ON au.id = p.user_id
WHERE p.email = 'admin@gmail.com';
```

Should return:
- email: admin@gmail.com
- role: admin
- auth_user_id: (UUID)

---

## ✅ Verification Checklist

- [ ] Role di database = `'admin'` (not 'user')
- [ ] Browser cache cleared
- [ ] Latest code deployed to Vercel
- [ ] Logout and login again
- [ ] URL redirects to `/admin/dashboard`
- [ ] Admin dashboard shows statistics
- [ ] Can access `/admin/customers`
- [ ] Can add customer via `/admin/add-customer`

---

## 🚨 If Still Not Working

### Emergency Fix: Force Redirect

Temporary workaround di `Login.tsx`:

```typescript
// Force admin redirect for testing
if (email === 'admin@gmail.com') {
  navigate('/admin/dashboard', { replace: true })
  return
}
```

**But this is NOT recommended for production!**

---

## 📞 Final Check

After all steps, test flow:

1. **Logout completely**
2. **Close all browser tabs**
3. **Open new incognito/private window**
4. **Go to**: `https://your-domain.vercel.app/login`
5. **Login**: `admin@gmail.com` / `trader1122`
6. **Should redirect to**: `/admin/dashboard` ✅

---

## 💡 Common Mistakes

❌ **Wrong:** User ID di profiles tidak match dengan auth.users
✅ **Fix:** Check `user_id` di profiles vs `id` di auth.users

❌ **Wrong:** Role column tidak exist
✅ **Fix:** Run `database-admin-setup.sql`

❌ **Wrong:** Browser cache old build
✅ **Fix:** Clear cache + hard refresh

❌ **Wrong:** Not logged out before testing
✅ **Fix:** Full logout, clear session

---

**Follow these steps dan admin login akan work!** 🎉
