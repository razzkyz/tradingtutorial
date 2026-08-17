# 🔗 Binance API Integration Guide

## ✅ Status Saat Ini:

1. ✅ Table `user_binance_keys` sudah ada di database
2. ✅ Table `trades` sudah ada di database  
3. ✅ RLS policies untuk Binance tables sudah ada
4. ✅ Supabase Edge Function `binance-trade` sudah dibuat
5. ✅ React Component `BinanceTrading` sudah dibuat
6. ❌ **Edge Function belum di-deploy ke Supabase**
7. ❌ **Component belum di-integrate ke Dashboard**

---

## 📋 Step-by-Step Integration:

### STEP 1: Deploy Supabase Edge Function

**Option A: Via Supabase CLI (Recommended)**

```bash
# 1. Install Supabase CLI (kalau belum)
npm install -g supabase

# 2. Login ke Supabase
supabase login

# 3. Link project ke local
supabase link --project-ref fcgfnuydswfxwqrqqlup

# 4. Deploy edge function
supabase functions deploy binance-trade

# 5. Set environment variables (penting!)
supabase secrets set SUPABASE_URL=https://fcgfnuydswfxwqrqqlup.supabase.co
supabase secrets set SUPABASE_ANON_KEY=<your-anon-key>
```

**Option B: Via Supabase Dashboard (Manual Upload)**

1. Go to: https://supabase.com/dashboard/project/fcgfnuydswfxwqrqqlup/functions
2. Click **"New Function"**
3. Name: `binance-trade`
4. Copy paste isi file: `supabase/functions/binance-trade/index.ts`
5. Click **Deploy**
6. Go to **Settings** tab
7. Add secrets:
   - `SUPABASE_URL` = `https://fcgfnuydswfxwqrqqlup.supabase.co`
   - `SUPABASE_ANON_KEY` = (your anon key from .env)

---

### STEP 2: Test Edge Function

Test dengan curl atau Postman:

```bash
curl -i --location --request POST \
  'https://fcgfnuydswfxwqrqqlup.supabase.co/functions/v1/binance-trade' \
  --header 'Authorization: Bearer YOUR_USER_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{"action":"get_balance"}'
```

Expected response:
```json
{
  "makerCommission": 10,
  "takerCommission": 10,
  "balances": [...]
}
```

---

### STEP 3: Add Binance Settings Page

Customer perlu input Binance API keys mereka. Buat halaman Settings:

**File:** `src/pages/Settings.tsx`

```typescript
// User input API key & Secret
// Save to user_binance_keys table
// Encrypt API secret before saving (optional but recommended)
```

**Features:**
- Input Binance API Key
- Input Binance API Secret
- Toggle Testnet/Mainnet
- Save to database
- Delete API keys

---

### STEP 4: Integrate BinanceTrading Component to Dashboard

**Option A: Replace TradingView dengan Binance Trading**

Edit `src/pages/Dashboard.tsx`:

```typescript
import BinanceTrading from '../components/BinanceTrading'

// Replace TradingView chart with BinanceTrading component
<BinanceTrading />
```

**Option B: Add as Separate Tab**

Buat tab switcher:
- Tab 1: TradingView (chart only)
- Tab 2: Binance Trading (live trading)

---

### STEP 5: Get Binance API Keys

**For Testing (Binance Testnet):**
1. Go to: https://testnet.binance.vision/
2. Login with GitHub/Google
3. Generate API Key & Secret
4. Use testnet API: `https://testnet.binance.vision`

**For Production (Real Binance):**
1. Go to: https://www.binance.com/en/my/settings/api-management
2. Create API Key
3. Enable **Spot & Margin Trading**
4. Restrict IP (for security)
5. **NEVER** enable withdrawal permission!

---

### STEP 6: Security Best Practices

⚠️ **CRITICAL SECURITY:**

1. **Never store API keys in frontend**
   - ✅ Store in database (encrypted if possible)
   - ✅ Access via Edge Function only
   - ❌ Never expose in React code

2. **Restrict Binance API permissions**
   - ✅ Enable: Spot & Margin Trading
   - ❌ Disable: Withdrawal
   - ✅ Use IP whitelist

3. **Use Testnet first**
   - Test with fake money first
   - Move to production only when ready

4. **Encrypt API secrets** (optional but recommended)
   ```sql
   -- Use pgcrypto extension
   CREATE EXTENSION IF NOT EXISTS pgcrypto;
   
   -- Encrypt before insert
   INSERT INTO user_binance_keys (user_id, api_key, api_secret)
   VALUES (
     'user-id',
     'api-key',
     crypt('api-secret', gen_salt('bf'))
   );
   ```

---

## 📊 How It Works:

### Architecture:

```
[Customer Browser]
      ↓
[React Component: BinanceTrading]
      ↓
[Supabase Edge Function: binance-trade]
      ↓ (fetch API keys from DB)
[user_binance_keys table]
      ↓
[Binance API]
      ↓
[Execute Trade]
      ↓
[Log to trades table]
```

### Flow:

1. **Customer input API keys** → Save to `user_binance_keys`
2. **Customer click BUY/SELL** → Send to Edge Function
3. **Edge Function** → Fetch API keys from DB
4. **Edge Function** → Call Binance API with keys
5. **Binance** → Execute trade
6. **Edge Function** → Log trade to `trades` table
7. **React Component** → Show success/error

---

## 🧪 Testing Checklist:

### Before Production:

- [ ] Deploy edge function successfully
- [ ] Test with Binance Testnet first
- [ ] Verify API keys stored securely
- [ ] Test BUY order on testnet
- [ ] Test SELL order on testnet
- [ ] Check trades logged to database
- [ ] Verify only owner can see their trades (RLS)
- [ ] Test error handling (invalid keys, insufficient balance)
- [ ] Test balance fetch
- [ ] Test open orders fetch

### Production:

- [ ] Switch to real Binance API
- [ ] Set IP whitelist on Binance
- [ ] Disable withdrawal permission
- [ ] Set trading limits (optional)
- [ ] Monitor trades closely
- [ ] Have kill switch ready (delete API keys)

---

## ⚠️ Important Notes:

1. **API Keys are sensitive**
   - Treat like passwords
   - Never log or expose
   - Encrypt if possible

2. **Binance Rate Limits**
   - Max 1200 requests/minute
   - Weight-based system
   - Handle rate limit errors

3. **Real Money Trading**
   - Start with small amounts
   - Test thoroughly first
   - Have risk management
   - Set stop-loss orders

4. **Legal Compliance**
   - Check local regulations
   - Binance may be banned in some countries
   - Need KYC for large amounts
   - Tax implications

---

## 🆘 Troubleshooting:

### Error: "Binance API keys not found"
**Fix:** Customer belum input API keys. Buat halaman Settings untuk input.

### Error: "Signature invalid"
**Fix:** 
- Check API secret benar
- Check timestamp sync (server time vs Binance time)
- Verify signature calculation

### Error: "IP not whitelisted"
**Fix:** Add Edge Function IP to Binance whitelist (atau disable IP restriction untuk test)

### Error: "Insufficient balance"
**Fix:** Customer balance tidak cukup di Binance

---

## 🚀 Next Steps:

1. **Deploy edge function** (STEP 1 above)
2. **Buat Settings page** untuk input API keys
3. **Integrate BinanceTrading component** ke Dashboard
4. **Test dengan Testnet** dulu
5. **Deploy ke production** setelah yakin

---

**Good luck! Be careful with real money trading!** 💰🚀

