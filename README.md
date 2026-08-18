# Trading Tutorials Platform

A modern, secure trading tutorial and portfolio management platform built with React, TypeScript, Tailwind CSS, and Supabase.

---

## ✨ Features

### 🔐 Authentication System
- Secure user registration and login
- Multi-device logout detection
- Session persistence and validation
- Protected routes with role-based access
- Admin and user role management

### 💰 Balance Management
- Multi-currency support (USDT, BTC, ETH, etc.)
- Real-time balance display
- Investment amount tracking
- Admin balance management

### 💸 Withdrawal System
- User withdrawal requests
- Multiple network support (ERC20, TRC20, BEP20)
- Admin approval workflow
- Withdrawal history tracking
- Status management (pending, approved, rejected, completed)

### 📊 Binance Integration
- API key management
- Real-time trading data
- Secure API key storage
- Trading status monitoring

### 👤 User Management
- Profile management
- Avatar upload
- User information (name, email, phone, country, address)
- Investment amount display

### 🛡️ Admin Features
- User overview and management
- Balance management for all users
- Withdrawal approval/rejection
- System configuration
- Analytics and reporting

### 🎨 Modern UI/UX
- Responsive design (mobile, tablet, desktop)
- Dark theme with blue/cyan accents
- Smooth animations and transitions
- Professional card-based layout
- Loading states and skeletons

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18 or higher
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trading-tutorials
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy example file
   copy .env.example .env
   
   # Edit .env with your Supabase credentials
   ```

4. **Set up database**
   - See `docs/DATABASE-SETUP-GUIDE.md`
   - Run `database/00-COMPLETE-DATABASE-SETUP.sql` in Supabase SQL Editor

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   ```
   http://localhost:5173
   ```

📚 **Full setup instructions**: See `docs/COMPLETE-SETUP-GUIDE.md`

---

## 📁 Project Structure

```
trading-tutorials/
├── database/              # Database setup scripts
│   ├── 00-COMPLETE-DATABASE-SETUP.sql  # Main setup
│   ├── 3-ADD-ADMIN.sql                 # Admin setup
│   ├── INSERT-DEMO-USERS.sql           # Demo data
│   └── insert-initial-data.sql
│
├── docs/                  # Documentation
│   ├── COMPLETE-SETUP-GUIDE.md         # Full setup guide
│   ├── DATABASE-SETUP-GUIDE.md         # Database guide
│   ├── AUTHENTICATION-FIX-COMPLETE.md  # Auth system
│   ├── ADMIN-SETUP-GUIDE.md            # Admin features
│   ├── BINANCE-INTEGRATION-GUIDE.md    # Binance setup
│   ├── DEPLOYMENT.md                   # Deploy guide
│   └── README.md                       # Docs overview
│
├── public/               # Static assets
│   ├── images/          # Logo, wallet icons
│   └── icons.svg        # SVG icons
│
├── src/
│   ├── components/      # React components
│   │   ├── Header.tsx
│   │   ├── BalanceCard.tsx
│   │   ├── WithdrawalForm.tsx
│   │   ├── BinanceTrading.tsx
│   │   └── ...
│   │
│   ├── pages/           # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Profile.tsx
│   │   ├── Withdrawal.tsx
│   │   ├── MarketGlobal.tsx
│   │   ├── Login.tsx
│   │   └── Admin/
│   │       ├── AdminDashboard.tsx
│   │       ├── UserManagement.tsx
│   │       └── WithdrawalManagement.tsx
│   │
│   ├── routes/          # Route protection
│   │   ├── ProtectedRoute.tsx
│   │   └── AdminRoute.tsx
│   │
│   ├── hooks/           # Custom hooks
│   │   └── useAuth.ts
│   │
│   ├── lib/             # Libraries
│   │   └── supabase.ts
│   │
│   └── layouts/         # Layout components
│       └── AppLayout.tsx
│
├── .env                 # Environment variables (create this)
├── .env.example         # Environment template
├── package.json         # Dependencies
├── vite.config.ts       # Vite configuration
└── tailwind.config.js   # Tailwind configuration
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing

### Backend
- **Supabase** - Backend as a Service
  - Authentication
  - PostgreSQL Database
  - Storage (avatars)
  - Row Level Security

### External APIs
- **Binance API** - Trading data and execution (optional)

---

## 📖 Documentation

All documentation is located in the `docs/` folder:

| Document | Description |
|----------|-------------|
| [COMPLETE-SETUP-GUIDE.md](docs/COMPLETE-SETUP-GUIDE.md) | Complete setup from scratch |
| [DATABASE-SETUP-GUIDE.md](docs/DATABASE-SETUP-GUIDE.md) | Database configuration |
| [AUTHENTICATION-FIX-COMPLETE.md](docs/AUTHENTICATION-FIX-COMPLETE.md) | Authentication system |
| [ADMIN-SETUP-GUIDE.md](docs/ADMIN-SETUP-GUIDE.md) | Admin features |
| [BINANCE-INTEGRATION-GUIDE.md](docs/BINANCE-INTEGRATION-GUIDE.md) | Binance setup |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment |
| [SECURITY.md](docs/SECURITY.md) | Security best practices |
| [PROJECT-SUMMARY.md](docs/PROJECT-SUMMARY.md) | Project overview |

---

## 🗄️ Database Schema

### Tables

**profiles**
- User profile information
- Role management (user/admin)
- Investment amount
- Contact details

**balances**
- Multi-currency balances
- Per-user currency tracking
- Auto-updated timestamps

**withdrawals**
- Withdrawal requests
- Status tracking
- Admin notes
- Network support

**binance_api_keys**
- Secure API key storage
- Per-user keys
- Active/inactive status

### Security
- Row Level Security (RLS) enabled
- Role-based access control
- Automatic profile creation on signup
- Secure storage policies

---

## 🎯 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🔧 Configuration

### Environment Variables

Required variables in `.env`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: Binance API
VITE_BINANCE_API_KEY=your-api-key
VITE_BINANCE_API_SECRET=your-api-secret
```

Get Supabase credentials from:
**Project Settings** > **API** in Supabase dashboard

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub/GitLab/Bitbucket
2. Import project in Vercel dashboard
3. Configure:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variables
5. Deploy!

📚 **Full guide**: See `docs/DEPLOYMENT.md`

### Other Platforms
- Netlify
- Railway
- Render
- AWS Amplify
- Any static hosting

---

## 🔐 Security Features

- ✅ Row Level Security (RLS)
- ✅ Role-based access control
- ✅ Secure session management
- ✅ Multi-device logout detection
- ✅ Protected API routes
- ✅ Input validation
- ✅ XSS protection
- ✅ CSRF protection

📚 **Details**: See `docs/SECURITY.md`

---

## 🎨 Customization

### Branding
- Logo: `public/images/logo.png`
- Favicon: `public/favicon.svg`
- Colors: `tailwind.config.js`
- App name: `index.html`

### Theme Colors
```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: '#0891b2',    // Cyan
      secondary: '#1e40af',  // Blue
      // Customize as needed
    }
  }
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 📧 Support

For questions or issues:
- Check documentation in `docs/` folder
- Review Supabase documentation
- Contact project maintainers

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend infrastructure
- [Tailwind CSS](https://tailwindcss.com) - UI styling
- [React](https://react.dev) - UI framework
- [Vite](https://vitejs.dev) - Build tool
- [Binance API](https://www.binance.com/en/binance-api) - Trading data

---

**Built with ❤️ using React + TypeScript + Supabase**
