# Trading Tutorials Web Application

A modern, secure trading tutorials dashboard built with React, TypeScript, and Supabase.

## 📋 Project Overview

Trading Tutorials is a full-stack web application that provides users with a secure dashboard to manage their trading balances, access market data, and submit withdrawal requests. The application follows modern security best practices with Row Level Security (RLS) and proper authentication flows.

## ✨ Features

- **Authentication**: Secure login system using Supabase Auth
- **Session Management**: Persistent sessions with automatic token refresh
- **Protected Routes**: Client-side route protection with loading states
- **User Profile**: View personal information and investment details
- **Balance Dashboard**: Real-time balance tracking across multiple accounts
- **Market Global**: View global market data and trading pairs
- **Trading Access**: Manage trading access and view total available balance
- **Withdrawal System**: Submit withdrawal requests with validation
- **Responsive Design**: Mobile-first design that works on all devices
- **Premium UI**: Dark fintech theme with teal/cyan/green gradients

## 🛠 Tech Stack

### Frontend
- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing

### Backend / BaaS
- **Supabase**: Backend-as-a-Service
  - Authentication
  - PostgreSQL database
  - Row Level Security (RLS)
  - Real-time capabilities

### Validation
- **Zod**: Runtime type validation

### Deployment
- **Vercel**: Frontend hosting and deployment

## 📁 Folder Structure

```
trading-tutorials/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── HamburgerMenu.tsx
│   │   ├── BalanceCard.tsx
│   │   ├── TradingStatus.tsx
│   │   ├── LoadingState.tsx
│   │   └── ErrorState.tsx
│   ├── layouts/
│   │   └── AppLayout.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Profile.tsx
│   │   ├── MarketGlobal.tsx
│   │   ├── TradingAccess.tsx
│   │   └── Withdrawal.tsx
│   ├── routes/
│   │   └── ProtectedRoute.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── services/
│   │   ├── profileService.ts
│   │   ├── balanceService.ts
│   │   └── withdrawalService.ts
│   ├── schemas/
│   │   └── withdrawalSchema.ts
│   ├── lib/
│   │   └── supabase.ts
│   ├── types/
│   │   └── database.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## 🗄 Database Schema

### Tables

#### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  address TEXT,
  phone_number TEXT,
  email TEXT NOT NULL,
  country TEXT,
  avatar_url TEXT,
  investment_amount NUMERIC(15, 2) DEFAULT 100.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

#### balances
```sql
CREATE TABLE balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_type TEXT NOT NULL,
  amount NUMERIC(15, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, balance_type)
);
```

#### trading_access
```sql
CREATE TABLE trading_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

#### withdrawals
```sql
CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  wallet_address TEXT NOT NULL,
  network TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes
```sql
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_balances_user_id ON balances(user_id);
CREATE INDEX idx_trading_access_user_id ON trading_access(user_id);
CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
```

## 🔒 Row Level Security (RLS)

All tables have RLS enabled. Users can only access their own data.

### profiles
```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SELECT policy
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT policy (for profile creation)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE policy
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### balances
```sql
-- Enable RLS
ALTER TABLE balances ENABLE ROW LEVEL SECURITY;

-- SELECT policy
CREATE POLICY "Users can view own balances"
  ON balances FOR SELECT
  USING (auth.uid() = user_id);

-- No UPDATE/DELETE for regular users
```

### trading_access
```sql
-- Enable RLS
ALTER TABLE trading_access ENABLE ROW LEVEL SECURITY;

-- SELECT policy
CREATE POLICY "Users can view own trading access"
  ON trading_access FOR SELECT
  USING (auth.uid() = user_id);

-- No UPDATE for regular users
```

### withdrawals
```sql
-- Enable RLS
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- SELECT policy
CREATE POLICY "Users can view own withdrawals"
  ON withdrawals FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT policy
CREATE POLICY "Users can create own withdrawals"
  ON withdrawals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- No UPDATE/DELETE for regular users
```

## 🔐 Security Measures

1. **Authentication**: Supabase Auth handles all authentication
2. **Session Management**: Automatic session refresh and validation
3. **Authorization**: RLS ensures users only access their own data
4. **IDOR Protection**: All queries filtered by authenticated user ID
5. **Input Validation**: Zod schemas validate all user inputs
6. **No Exposed Secrets**: Service role keys never sent to frontend
7. **Safe Error Messages**: Generic error messages prevent information leakage
8. **XSS Protection**: React's built-in XSS protection (no dangerouslySetInnerHTML)

## 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

**IMPORTANT**: Never commit your `.env` file or expose your service role key in the frontend.

## 🚀 Local Development

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd trading-tutorials
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

4. Run the development server:
```bash
npm run dev
```

5. Open your browser at `http://localhost:3000`

## 🏗 Build

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## 📦 Deployment to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Deploy

## 🧪 Supabase Setup

### 1. Create Supabase Project
- Go to https://supabase.com
- Create a new project
- Note your project URL and anon key

### 2. Run Database Migrations
Execute the SQL scripts in the Supabase SQL Editor:
- Create tables (see Database Schema section)
- Enable RLS
- Create policies
- Create indexes

### 3. Seed Data (Optional)
Create test users and seed data:

```sql
-- Create test user via Supabase Auth Dashboard first
-- Then seed profile
INSERT INTO profiles (user_id, full_name, email, address, phone_number, country, investment_amount)
VALUES 
  ('user-uuid-here', 'Mark Cloop', 'markcloop@gmail.com', 'California', '+15553633566', 'America', 100.00);

-- Seed balances
INSERT INTO balances (user_id, balance_type, amount)
VALUES 
  ('user-uuid-here', 'balance_1', 200.00),
  ('user-uuid-here', 'balance_2', 400.00),
  ('user-uuid-here', 'balance_3', 500.00),
  ('user-uuid-here', 'balance_4', 700.00);

-- Seed trading access
INSERT INTO trading_access (user_id, status)
VALUES 
  ('user-uuid-here', 'inactive');
```

## 🎨 Design System

### Color Palette
- **Deep Navy**: `#061923` - Primary background
- **Dark Teal**: `#063B4C` - Secondary background
- **Teal**: `#087E8B` - Accent color
- **Emerald**: `#16A085` - Success states
- **Cyan**: `#20C9D8` - Interactive elements
- **Green**: `#22C55E` - Active states

### Gradients
- **Main Background**: `linear-gradient(135deg, #061923 0%, #073B4C 45%, #075F65 100%)`
- **Card Gradient**: `linear-gradient(135deg, #063B4C, #087E8B)`
- **Button Gradient**: `linear-gradient(135deg, #087E8B, #20C9D8)`
- **Active Gradient**: `linear-gradient(135deg, #16A085, #22C55E)`

## ⚠️ Important Notes

1. **This is a Demo Application**: No real cryptocurrency transactions occur
2. **Withdrawal Requests**: Create database records only, no blockchain transactions
3. **Balance Management**: Admin-controlled via database, users have read-only access
4. **Trading Status**: Admin-controlled, users cannot change their own status
5. **Payment Gateway**: Not implemented in this version; architecture supports future integration

## 🔍 Security Audit Checklist

- [x] Authentication via Supabase Auth
- [x] Session management with auto-refresh
- [x] RLS enabled on all tables
- [x] User isolation via auth.uid()
- [x] IDOR protection tested
- [x] Input validation with Zod
- [x] No service role key in frontend
- [x] No hardcoded credentials
- [x] Safe error messages
- [x] No XSS vulnerabilities
- [x] Protected routes implemented
- [x] Balance server-controlled
- [x] Trading status server-controlled
- [x] Withdrawal validation

## 📄 License

This project is for technical assessment purposes.

## 👥 Support

For issues or questions, please contact the development team.
