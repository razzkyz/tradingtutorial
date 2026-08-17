# 🚀 Binance Trading - Quick Start

## ✅ Yang Sudah Dibuat:

1. ✅ Table `user_binance_keys` & `trades` di database
2. ✅ RLS policies untuk Binance tables
3. ✅ Edge Function `binance-trade` (belum deploy)
4. ✅ Settings page untuk input API keys
5. ✅ BinanceTrading component (belum integrate ke Dashboard)

---

## 📝 TODO List (Urutan):

### 1. Deploy Supabase Edge Function

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref fcgfnuydswfxwqrqqlup

# Deploy function
supabase functions deploy binance-trade

# Set secrets
supabase secrets set SUPABASE_URL=https://fcgfnuydswfxwqrqqlup.supabase.co
supabase secrets set SUPABASE_ANON_KEY=(paste anon key dari .env)
```

**Atau via Dashboard:**
- Go to: https://supabase.com/dashboard/project/fcgfnuydswfxwqrqqlup/functions
- New Function → Name: `binance-trade`
- Copy paste dari `supabase/functions/binance-trade/index.ts`
- Deploy

---

### 2. Test Settings Page

```
http://localhost:3000/settings
```

**Features:**
- Toggle Testnet/Mainnet
- Input API Key
- Input API Secret
- Save to database
- Delete keys

---

### 3. Get Binance Testnet Keys

1. Go to: https://testnet.binance.vision/
2. Login with GitHub
3. API Key Management → Create API Key
4. Copy API Key & Secret
5. Paste di Settings page

---

### 4. Integrate BinanceTrading Component

**Option A: Add to Dashboard as Tab**

Edit `src/pages/Dashboard.tsx`:

```typescript
import { useState } from 'react'
import BinanceTrading from '../components/BinanceTrading'

// Add tab state
const [activeTab, setActiveTab] = useState<'chart' | 'trading'>('chart')

// Add tab switcher UI
<div className="flex gap-2 mb-4">
  <button 
    onClick={() => setActiveTab('chart')}
    className={`px-4 py-2 rounded ${activeTab === 'chart' ? 'bg-cyan-600' : 'bg-gray-700'}`}
  >
    Chart View
  </button>
  <button 
    onClick={() => setActiveTab('trading')}
    className={`px-4 py-2 rounded ${activeTab === 'trading' ? 'bg-cyan-600' : 'bg-gray-700'}`}
  >
    Live Trading
  </button>
</div>

// Conditional render
{activeTab === 'chart' && (
  <div className="tradingview-chart">
    {/* TradingView chart code */}
  </div>
)}

{activeTab === 'trading' && (
  <BinanceTrading />
)}
```

**Option B: Replace TradingView**

```typescript
// Remove TradingView code
// Add BinanceTrading component
<BinanceTrading />
```

---

### 5. Test Trading Flow

1. Login sebagai customer
2. Go to Settings
3. Input Binance Testnet API keys
4. Save
5. Go to Dashboard
6. Click "Live Trading" tab (if using tab)
7. Select symbol (BTC/USDT)
8. Enter amount
9. Click BUY or SELL
10. Check trades table in database

---

## 🔒 Security Checklist:

- [x] API keys stored in database (not in frontend)
- [x] Edge function handles all Binance API calls
- [x] RLS policies restrict access to own keys
- [ ] Test with Testnet first
- [ ] Restrict IP on Binance API (production only)
- [ ] Disable withdrawal permission on Binance

---

## 🎯 Final Result:

Customer dapat:
1. ✅ Input Binance API keys di Settings page
2. ✅ Lihat balance Binance di Dashboard
3. ✅ Execute BUY/SELL orders langsung dari web
4. ✅ Lihat trade history
5. ✅ Real-time trading (kalau API keys valid)

---

## 📊 Architecture:

```
Customer
  ↓
Settings Page (input API keys)
  ↓
user_binance_keys table (stored securely)
  ↓
Dashboard → BinanceTrading Component
  ↓
Edge Function: binance-trade
  ↓
Binance API (execute trade)
  ↓
trades table (log history)
```

---

## ⚠️ Important:

1. **Test dengan Testnet dulu!** Jangan langsung ke real money
2. **API Secret harus disimpan aman** - never log atau expose
3. **Disable withdrawal permission** di Binance API settings
4. **Set trading limits** kalau mau deploy production
5. **Monitor trades** - jangan biarkan auto-trade tanpa supervisi

---

**Sekarang tinggal deploy edge function dan test!** 🚀

