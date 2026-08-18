# Admin Guide: Add Multi-Currency Balance

## Cara Menambahkan Balance dengan Currency Berbeda

### Step 1: Jalankan Database Update (Hanya Sekali)

1. Buka **Supabase Dashboard**
2. Masuk ke **SQL Editor**
3. Copy paste script dari file `database-multi-currency-update.sql`
4. Klik **Run** atau tekan `Ctrl+Enter`

### Step 2: Menambahkan Balance ke User

Gunakan SQL query berikut di **Supabase SQL Editor**:

```sql
-- Ganti USER_ID_DISINI dengan UUID user yang sebenarnya
-- Ganti CURRENCY dengan BTC, ETH, USDT, dll
-- Ganti AMOUNT dengan jumlah yang ingin diberikan

-- Contoh: Menambahkan 0.5 BTC ke Balance 1
INSERT INTO balances (user_id, balance_type, currency, amount)
VALUES ('USER_ID_DISINI', 'balance_1', 'BTC', 0.5)
ON CONFLICT (user_id, balance_type, currency) 
DO UPDATE SET amount = balances.amount + EXCLUDED.amount;

-- Contoh: Menambahkan 2.5 ETH ke Balance 2
INSERT INTO balances (user_id, balance_type, currency, amount)
VALUES ('USER_ID_DISINI', 'balance_2', 'ETH', 2.5)
ON CONFLICT (user_id, balance_type, currency) 
DO UPDATE SET amount = balances.amount + EXCLUDED.amount;

-- Contoh: Menambahkan 1000 USDT ke Balance 3
INSERT INTO balances (user_id, balance_type, currency, amount)
VALUES ('USER_ID_DISINI', 'balance_3', 'USDT', 1000)
ON CONFLICT (user_id, balance_type, currency) 
DO UPDATE SET amount = balances.amount + EXCLUDED.amount;
```

### Step 3: Cara Mendapatkan User ID

```sql
-- Tampilkan semua user dengan email mereka
SELECT 
  u.id as user_id, 
  u.email, 
  p.full_name
FROM auth.users u
LEFT JOIN profiles p ON p.user_id = u.id
ORDER BY p.full_name;
```

### Supported Currencies

Anda bisa menggunakan currency apapun! Contoh:

- **USDT** - Tether (stablecoin)
- **BTC** - Bitcoin
- **ETH** - Ethereum
- **BNB** - Binance Coin
- **SOL** - Solana
- **ADA** - Cardano
- **XRP** - Ripple
- **DOGE** - Dogecoin
- **DOT** - Polkadot
- **MATIC** - Polygon
- **AVAX** - Avalanche
- **LINK** - Chainlink
- **LTC** - Litecoin
- Atau currency custom lainnya

### Balance Types

- `balance_1` - Balance pertama
- `balance_2` - Balance kedua
- `balance_3` - Balance ketiga
- `balance_4` - Balance keempat

### Contoh Lengkap: Setup User dengan Multiple Currencies

```sql
-- User bisa punya multiple currencies di setiap balance type
-- Misalnya Balance 1 = 100 USDT + 0.05 BTC

-- USER_ID (ganti dengan ID user sebenarnya)
-- Untuk demo user: SELECT id FROM auth.users WHERE email = 'demo@tradingtutorials.com';

-- Balance 1: USDT dan BTC
INSERT INTO balances (user_id, balance_type, currency, amount) VALUES
('YOUR_USER_ID', 'balance_1', 'USDT', 200),
('YOUR_USER_ID', 'balance_1', 'BTC', 0.05);

-- Balance 2: ETH dan BNB
INSERT INTO balances (user_id, balance_type, currency, amount) VALUES
('YOUR_USER_ID', 'balance_2', 'ETH', 1.5),
('YOUR_USER_ID', 'balance_2', 'BNB', 10);

-- Balance 3: SOL
INSERT INTO balances (user_id, balance_type, currency, amount) VALUES
('YOUR_USER_ID', 'balance_3', 'SOL', 50);

-- Balance 4: USDT
INSERT INTO balances (user_id, balance_type, currency, amount) VALUES
('YOUR_USER_ID', 'balance_4', 'USDT', 500);
```

### Update Balance (Menambah/Mengurangi)

```sql
-- Menambah balance (menggunakan ON CONFLICT DO UPDATE)
INSERT INTO balances (user_id, balance_type, currency, amount)
VALUES ('USER_ID', 'balance_1', 'BTC', 0.1)
ON CONFLICT (user_id, balance_type, currency) 
DO UPDATE SET 
  amount = balances.amount + EXCLUDED.amount,
  updated_at = NOW();

-- Mengurangi balance (hati-hati jangan sampai minus!)
UPDATE balances 
SET amount = amount - 0.05
WHERE user_id = 'USER_ID' 
  AND balance_type = 'balance_1' 
  AND currency = 'BTC';

-- Set balance ke nilai tertentu (overwrite)
UPDATE balances 
SET amount = 1.5
WHERE user_id = 'USER_ID' 
  AND balance_type = 'balance_2' 
  AND currency = 'ETH';
```

### View All Balances

```sql
-- Lihat semua balance untuk satu user
SELECT 
  b.balance_type,
  b.currency,
  b.amount,
  b.updated_at
FROM balances b
WHERE b.user_id = 'USER_ID'
ORDER BY b.balance_type, b.currency;

-- Lihat total per currency untuk satu user
SELECT 
  b.currency,
  SUM(b.amount) as total_amount
FROM balances b
WHERE b.user_id = 'USER_ID'
GROUP BY b.currency
ORDER BY b.currency;
```

### Delete Balance

```sql
-- Hapus balance tertentu
DELETE FROM balances 
WHERE user_id = 'USER_ID' 
  AND balance_type = 'balance_1' 
  AND currency = 'BTC';

-- Hapus semua balance user (hati-hati!)
DELETE FROM balances WHERE user_id = 'USER_ID';
```

## Tampilan di Dashboard User

User akan melihat:

### Total Balance Card (Pojok Kanan Atas)
```
Total Balance
BTC 0.15
ETH 2.50
USDT 1700
```

### Balance 1, 2, 3, 4 Boxes
```
Balance 1
USDT 200.00
BTC 0.05

Balance 2
ETH 1.50
BNB 10.00
```

## Tips untuk Admin

1. **Backup sebelum update**: Selalu backup database sebelum melakukan perubahan besar
2. **Test dengan dummy user dulu**: Jangan langsung test di user production
3. **Gunakan ON CONFLICT DO UPDATE**: Untuk menghindari error duplicate key
4. **Check total balance**: Pastikan amount tidak negatif
5. **Log transactions**: Pertimbangkan membuat tabel transaction history untuk tracking

## Troubleshooting

**Q: Error "duplicate key value violates unique constraint"**
A: Artinya balance dengan `user_id + balance_type + currency` sudah ada. Gunakan `ON CONFLICT DO UPDATE` atau `UPDATE` langsung.

**Q: Balance tidak muncul di dashboard?**
A: Pastikan:
- `user_id` benar (UUID format)
- `balance_type` sesuai: balance_1, balance_2, balance_3, balance_4
- User sudah login ulang untuk refresh data

**Q: Ingin menambahkan currency baru?**
A: Tinggal insert saja! Tidak perlu konfigurasi khusus. Currency bisa string apapun (BTC, ETH, CUSTOM, dll)
