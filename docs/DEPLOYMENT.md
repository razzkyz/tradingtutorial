# Deployment Guide

Panduan lengkap untuk deploy Trading Tutorials ke production.

## 🎯 Target Deployment Platform

**Vercel** - Recommended platform untuk React + Vite applications

Kenapa Vercel?
- ✅ Zero-config deployment untuk Vite
- ✅ Automatic HTTPS
- ✅ CDN global
- ✅ Easy environment variables management
- ✅ Free tier yang generous
- ✅ CI/CD otomatis dari GitHub

## 📋 Pre-Deployment Checklist

### 1. Code Ready
- [ ] Semua fitur sudah complete dan tested
- [ ] `npm run build` berhasil tanpa error
- [ ] `npm run preview` berjalan dengan baik
- [ ] No console errors di production build
- [ ] TypeScript compile tanpa error

### 2. Environment Variables
- [ ] `.env` file sudah berisi VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY
- [ ] `.env` ada di `.gitignore` (JANGAN commit ke git)
- [ ] `.env.example` sudah dibuat sebagai template

### 3. Database
- [ ] Database tables sudah created di Supabase
- [ ] RLS policies sudah aktif
- [ ] Test user sudah dibuat
- [ ] Seed data sudah inserted

### 4. Git Repository
- [ ] Code sudah di push ke GitHub/GitLab/Bitbucket
- [ ] `.gitignore` mencegah sensitive files
- [ ] README.md up to date

## 🚀 Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Push to GitHub

```bash
# Initialize git (jika belum)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Trading Tutorials app"

# Add remote (ganti dengan repo URL Anda)
git remote add origin https://github.com/username/trading-tutorials.git

# Push to GitHub
git push -u origin main
```

### Step 2: Import di Vercel

1. **Login ke Vercel**
   - Buka https://vercel.com
   - Login dengan GitHub account

2. **Import Repository**
   - Klik "Add New..." → "Project"
   - Select "Import Git Repository"
   - Pilih repository: `trading-tutorials`
   - Klik "Import"

3. **Configure Project**
   
   **Framework Preset:** Vite (auto-detected)
   
   **Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   
   (Biasanya sudah auto-detected, tidak perlu diubah)

4. **Add Environment Variables**
   
   Klik "Environment Variables", lalu add:
   
   ```
   Name: VITE_SUPABASE_URL
   Value: https://your-project.supabase.co
   ```
   
   ```
   Name: VITE_SUPABASE_PUBLISHABLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   
   **PENTING:** 
   - Centang "Production", "Preview", dan "Development"
   - JANGAN add `VITE_SUPABASE_SERVICE_ROLE_KEY` di sini!

5. **Deploy**
   - Klik "Deploy"
   - Wait 1-2 minutes
   - Done! ✅

6. **Get Production URL**
   - URL format: `https://trading-tutorials.vercel.app`
   - atau custom domain jika sudah dikonfigurasi

### Step 3: Test Production Deployment

1. Buka production URL
2. Test login dengan credentials
3. Test semua pages (Dashboard, Profile, Market, Trading Access, Withdrawal)
4. Test withdrawal submission
5. Test logout

## 🚀 Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

Follow instructions untuk authenticate.

### Step 3: Deploy

Di root folder `trading-tutorials/`:

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Step 4: Add Environment Variables via CLI

```bash
vercel env add VITE_SUPABASE_URL
# Paste value saat diminta

vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
# Paste value saat diminta
```

Pilih environment: Production, Preview, Development (all)

## 🔄 Continuous Deployment

Setelah initial deployment, setiap push ke GitHub akan trigger automatic deployment:

```bash
# Make changes
git add .
git commit -m "Update feature X"
git push

# Vercel automatically:
# 1. Detects push
# 2. Builds project
# 3. Runs tests (if configured)
# 4. Deploys to preview URL
```

### Branch Deployments

- **Main/Master branch** → Production URL
- **Other branches** → Preview URLs (unique per branch)

## ⚙️ Advanced Configuration

### Custom Domain

1. Di Vercel Dashboard → Project Settings → Domains
2. Add custom domain: `tradingtutorials.com`
3. Update DNS records as instructed
4. Wait for DNS propagation (5-60 minutes)
5. Automatic HTTPS certificate issued

### Build Optimization

Edit `vite.config.ts` untuk optimize production build:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js']
        }
      }
    }
  }
})
```

### Environment per Branch

Vercel supports different env vars per environment:

- **Production**: `main` branch
- **Preview**: All other branches
- **Development**: Local `vercel dev`

Configure di Settings → Environment Variables → pilih environment.

## 🔒 Security Checklist untuk Production

- [ ] `.env` tidak ter-commit ke git
- [ ] Service role key TIDAK di environment variables Vercel
- [ ] HTTPS enabled (automatic di Vercel)
- [ ] RLS policies tested dan aktif
- [ ] Error messages tidak expose internal details
- [ ] CORS configured di Supabase (allow Vercel domain)

## 📊 Monitoring & Analytics

### Vercel Analytics

Enable di Project Settings → Analytics

Features:
- Page views
- User sessions
- Performance metrics
- Core Web Vitals

### Supabase Dashboard

Monitor di Supabase Dashboard:
- Database queries
- Auth events
- API usage
- Error logs

### Error Tracking (Optional)

Integrate Sentry untuk error tracking:

```bash
npm install @sentry/react
```

Configure di `main.tsx`:

```typescript
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
})
```

## 🔧 Troubleshooting Production Issues

### Issue: Build fails on Vercel

**Check:**
1. `npm run build` works locally?
2. All dependencies in `package.json`?
3. No import errors?
4. TypeScript compiles?

**Solution:**
```bash
# Locally test production build
npm run build
npm run preview
```

### Issue: Environment variables not working

**Check:**
1. Variables start with `VITE_`?
2. Variables added in Vercel dashboard?
3. Correct environment selected?

**Solution:**
- Redeploy after adding env vars
- Check Deployment Logs di Vercel

### Issue: 404 on refresh

**Vercel auto-handles** React Router dengan SPA fallback.

Jika masih 404, tambahkan `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Issue: Supabase connection fails

**Check:**
1. Supabase URL correct?
2. Anon key correct?
3. Supabase project active?

**Solution:**
- Verify env vars di Vercel
- Check Supabase project status
- Test API manually: `https://your-project.supabase.co/rest/v1/`

### Issue: RLS blocking queries

**Check:**
1. RLS policies created?
2. User authenticated?
3. `auth.uid()` matches `user_id`?

**Solution:**
```sql
-- Verify policies exist
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Test policy
SELECT * FROM profiles WHERE user_id = auth.uid();
```

## 📈 Performance Optimization

### Image Optimization

If adding images in future:

```bash
npm install sharp
```

Use optimized image formats (WebP, AVIF)

### Code Splitting

Already configured via Vite + React lazy loading.

Add more splitting:

```typescript
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Profile = lazy(() => import('./pages/Profile'))
// etc.
```

### Caching Strategy

Vercel automatic caching:
- Static assets: 1 year cache
- HTML: No cache (always fresh)
- API routes: Configurable

### Lighthouse Score Goals

- **Performance:** 90+
- **Accessibility:** 90+
- **Best Practices:** 90+
- **SEO:** 90+

## 🔐 Post-Deployment Security

### 1. Test IDOR Protection

```bash
# Try to access another user's data
curl -H "Authorization: Bearer USER_A_TOKEN" \
  https://your-app.vercel.app/api/profile?user_id=USER_B_ID

# Expected: Error or only USER_A data
```

### 2. Test XSS

Try input: `<script>alert('xss')</script>`

Expected: Rendered as text, not executed

### 3. Test SQL Injection

Try input: `' OR '1'='1`

Expected: Treated as literal string, not SQL

### 4. Security Headers

Check headers via: https://securityheaders.com

Vercel automatic headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`

## 🎉 Deployment Complete Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created dan configured
- [ ] Environment variables added
- [ ] Initial deployment successful
- [ ] Production URL accessible
- [ ] Login working
- [ ] All pages accessible
- [ ] Withdrawal submission working
- [ ] Logout working
- [ ] No console errors
- [ ] Mobile responsive tested
- [ ] Performance acceptable (Lighthouse)
- [ ] Security tested (IDOR, XSS, etc.)

## 📞 Support

**Vercel Support:**
- Documentation: https://vercel.com/docs
- Support: support@vercel.com

**Supabase Support:**
- Documentation: https://supabase.com/docs
- Discord: https://discord.supabase.com

## 🚀 Next Steps

After successful deployment:

1. **Custom Domain** - Add professional domain
2. **Analytics** - Enable Vercel Analytics
3. **Monitoring** - Set up error tracking
4. **Backup** - Regular database backups
5. **Scaling** - Monitor and upgrade as needed

---

**Congratulations!** 🎉 

Your Trading Tutorials app is now live in production!
