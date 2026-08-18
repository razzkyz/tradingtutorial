# Complete Setup Guide

Step-by-step guide to set up the Trading Tutorials application from scratch.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Supabase Setup](#supabase-setup)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Running the Application](#running-the-application)
7. [Creating Admin User](#creating-admin-user)
8. [Testing](#testing)
9. [Deployment](#deployment)

---

## Prerequisites

### Required Software
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

### Required Accounts
- **Supabase Account** - [Sign up](https://supabase.com)
- **Vercel Account** (for deployment) - [Sign up](https://vercel.com)
- **Binance Account** (optional, for trading features) - [Sign up](https://www.binance.com)

---

## Project Setup

### Step 1: Clone or Download the Project

```bash
# If using Git
git clone <repository-url>
cd trading-tutorials

# Or download and extract the ZIP file
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React & React DOM
- TypeScript
- Vite
- Tailwind CSS
- Supabase client
- React Router
- And more...

---

## Supabase Setup

### Step 1: Create a New Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New project"**
3. Fill in project details:
   - **Name**: Trading Tutorials
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Plan**: Free tier is fine for development
4. Click **"Create new project"**
5. Wait for project to finish setting up (~2 minutes)

### Step 2: Get Project Credentials

1. Go to **Project Settings** (gear icon)
2. Navigate to **API** section
3. Copy these values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **Project API keys** > **anon/public**: `eyJhbG...`

Keep these safe - you'll need them next!

---

## Database Setup

### Step 1: Open SQL Editor

1. In Supabase dashboard, click **SQL Editor** in left sidebar
2. Click **"New query"**

### Step 2: Run Complete Setup Script

1. Open the file: `database/00-COMPLETE-DATABASE-SETUP.sql` from your project
2. Copy the entire content
3. Paste into Supabase SQL Editor
4. Click **"Run"** (or press Ctrl+Enter)
5. Wait for completion (you should see "Success. No rows returned")

This creates:
- ✅ All database tables (profiles, balances, withdrawals, binance_api_keys)
- ✅ Indexes for performance
- ✅ Storage bucket for avatars
- ✅ Row Level Security policies
- ✅ Automatic triggers
- ✅ Profile auto-creation on signup

### Step 3: Verify Database Setup

Run this query to verify:

```sql
-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should return: profiles, balances, withdrawals, binance_api_keys
```

📚 **Detailed guide**: See `docs/DATABASE-SETUP-GUIDE.md`

---

## Environment Configuration

### Step 1: Create Environment File

Copy the example environment file:

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

### Step 2: Configure Environment Variables

Open `.env` and update with your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Binance API (for trading features)
VITE_BINANCE_API_KEY=your-binance-api-key
VITE_BINANCE_API_SECRET=your-binance-api-secret
```

Replace:
- `VITE_SUPABASE_URL` with your Project URL from Step "Supabase Setup"
- `VITE_SUPABASE_ANON_KEY` with your anon key from Step "Supabase Setup"

⚠️ **Important**: Never commit `.env` to Git! It's already in `.gitignore`.

---

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start at: `http://localhost:5173`

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

---

## Creating Admin User

### Step 1: Create User via Supabase Dashboard

1. Go to **Authentication** > **Users** in Supabase
2. Click **"Add user"**
3. Fill in:
   - **Email**: `admin@tradingtutorials.com` (or your email)
   - **Password**: Create a strong password
   - **Auto Confirm User**: ✅ Check this box
4. Click **"Create user"**

### Step 2: Set Admin Role

1. Go to **SQL Editor** in Supabase
2. Run this query:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@tradingtutorials.com';
```

Replace the email with the one you used.

### Step 3: Verify Admin Access

1. Open the application: `http://localhost:5173`
2. Click **"Login"**
3. Enter admin credentials
4. You should see admin-only features:
   - User management
   - Balance management
   - Withdrawal approval
   - System settings

📚 **Detailed guide**: See `docs/ADMIN-SETUP-GUIDE.md`

---

## Testing

### Test User Registration

1. Go to application homepage
2. Click **"Sign Up"** or **"Register"**
3. Fill in the registration form
4. Click **"Create Account"**
5. You should be logged in automatically
6. Profile should be created with default "user" role

### Test User Login

1. Logout if logged in
2. Click **"Login"**
3. Enter user credentials
4. Click **"Sign In"**
5. Should redirect to Dashboard

### Test Balance Display

1. Login as admin
2. Go to admin panel
3. Add balance to a user:
   ```sql
   INSERT INTO balances (user_id, currency, amount)
   VALUES ('user-uuid-here', 'USDT', 1000.00);
   ```
4. Login as that user
5. Balance should display on Dashboard

### Test Withdrawal

1. Login as regular user with balance
2. Go to **Withdrawal** page
3. Fill in withdrawal form:
   - Amount
   - Wallet address
   - Network (ERC20/TRC20/BEP20)
4. Submit withdrawal
5. Should appear in withdrawal history as "pending"
6. Login as admin to approve/reject

### Test Authentication Features

- ✅ Multi-device logout detection
- ✅ Session validation
- ✅ Protected routes
- ✅ Auto-redirect on logout
- ✅ Session persistence

📚 **Authentication details**: See `docs/AUTHENTICATION-FIX-COMPLETE.md`

---

## Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click **"New Project"**
   - Import your Git repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: ./
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Add Environment Variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Click **"Deploy"**

3. **Deploy via CLI**:
   ```bash
   vercel
   ```
   Follow the prompts.

### Production Environment Variables

Create `.env.production`:

```env
VITE_SUPABASE_URL=your-production-supabase-url
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

📚 **Deployment guide**: See `docs/DEPLOYMENT.md`

---

## Project Structure

```
trading-tutorials/
├── database/              # Database SQL files
│   ├── 00-COMPLETE-DATABASE-SETUP.sql
│   ├── 3-ADD-ADMIN.sql
│   ├── INSERT-DEMO-USERS.sql
│   └── ...
├── docs/                  # Documentation
│   ├── COMPLETE-SETUP-GUIDE.md (this file)
│   ├── DATABASE-SETUP-GUIDE.md
│   ├── AUTHENTICATION-FIX-COMPLETE.md
│   └── ...
├── public/               # Static assets
│   ├── images/
│   └── icons.svg
├── src/                  # Source code
│   ├── components/       # React components
│   ├── hooks/           # Custom hooks
│   ├── layouts/         # Layout components
│   ├── lib/             # Libraries (Supabase client)
│   ├── pages/           # Page components
│   ├── routes/          # Route protection
│   └── App.tsx          # Main app component
├── .env                 # Environment variables (create this)
├── .env.example         # Environment template
├── package.json         # Dependencies
└── vite.config.ts       # Vite configuration
```

---

## Quick Start Checklist

- [ ] Node.js installed
- [ ] Project dependencies installed (`npm install`)
- [ ] Supabase project created
- [ ] Database setup script executed
- [ ] `.env` file configured
- [ ] Application running (`npm run dev`)
- [ ] Admin user created
- [ ] User registration tested
- [ ] Login/logout tested
- [ ] Balance display tested

---

## Common Issues & Solutions

### Issue: "Failed to fetch" error

**Solution**: Check your `.env` file has correct Supabase URL and key.

### Issue: Cannot login after creating user

**Solution**: Make sure "Auto Confirm User" was checked when creating the user.

### Issue: Profile not created after signup

**Solution**: Check if the trigger exists in database. Re-run section 8 of setup script.

### Issue: Balance not displaying

**Solution**: 
1. Check if balance exists in database
2. Verify RLS policies are correct
3. Check browser console for errors

### Issue: Admin features not visible

**Solution**: Verify admin role:
```sql
SELECT role FROM profiles WHERE email = 'your-email@example.com';
```

---

## Next Steps

After completing setup:

1. **Customize Branding**
   - Update logo in `public/images/`
   - Modify colors in `tailwind.config.js`
   - Update app name in `index.html`

2. **Configure Binance Integration** (Optional)
   - See `docs/BINANCE-INTEGRATION-GUIDE.md`
   - Set up API keys
   - Test trading features

3. **Add Demo Users**
   - See `database/INSERT-DEMO-USERS.sql`
   - Useful for testing and demonstrations

4. **Security Configuration**
   - See `docs/SECURITY.md`
   - Review RLS policies
   - Configure CORS if needed

5. **Deploy to Production**
   - See `docs/DEPLOYMENT.md`
   - Set up custom domain
   - Configure production database

---

## Getting Help

### Documentation Files
- `docs/README.md` - Project overview
- `docs/DATABASE-SETUP-GUIDE.md` - Database details
- `docs/AUTHENTICATION-FIX-COMPLETE.md` - Auth system
- `docs/ADMIN-SETUP-GUIDE.md` - Admin features
- `docs/BINANCE-INTEGRATION-GUIDE.md` - Trading features
- `docs/DEPLOYMENT.md` - Production deployment

### External Resources
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)

---

**Setup Complete! 🎉** Your Trading Tutorials application is now ready to use.
