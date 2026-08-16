# 📊 Admin Withdrawal Management & Bookkeeping

## Overview
Sistem pembukuan dan manajemen withdrawal untuk admin. Setiap withdrawal yang dibuat user akan tercatat dan dapat dikelola oleh admin.

## 🎯 Fitur Pembukuan Withdrawal

### 1. **Tracking Withdrawal Otomatis**
Ketika user submit withdrawal request:
- ✅ Withdrawal tercatat di database dengan status `pending`
- ✅ Admin dapat melihat semua withdrawal di Admin Dashboard
- ✅ Data lengkap: user, amount, network, wallet address, tanggal

### 2. **Admin Bookkeeping Fields**
Setiap withdrawal memiliki field untuk pembukuan:
- `status` - pending, approved, rejected, completed
- `admin_notes` - Catatan admin untuk pembukuan
- `processed_by` - Admin yang memproses
- `processed_at` - Waktu diproses
- `transaction_hash` - Hash transaksi blockchain

## 🔧 Database Setup

### Jalankan Migration
```sql
-- Jalankan file SQL ini di Supabase SQL Editor
-- File: database-withdrawal-tracking.sql
```

SQL akan menambahkan kolom:
- `admin_notes` - TEXT (catatan pembukuan)
- `processed_by` - UUID (reference ke admin user)
- `processed_at` - TIMESTAMPTZ (waktu proses)
- `transaction_hash` - VARCHAR(255) (hash blockchain)

## 📋 Admin Dashboard - Withdrawal List

### Melihat Semua Withdrawal Requests
Admin bisa:
1. ✅ Lihat semua withdrawal pending
2. ✅ Lihat detail: User, Amount, Network, Wallet
3. ✅ Filter by status (pending/approved/rejected/completed)
4. ✅ Sort by date (newest first)

### Memproses Withdrawal
Admin dapat:
1. **Approve** - Setujui withdrawal
2. **Reject** - Tolak withdrawal
3. **Mark as Completed** - Tandai sudah ditransfer
4. **Add Notes** - Tambah catatan pembukuan

## 📊 Contoh Query untuk Admin

### Lihat Semua Withdrawal Pending
```sql
SELECT 
    w.id,
    p.full_name as user_name,
    p.email,
    w.amount,
    w.wallet_address,
    w.network,
    w.status,
    w.created_at,
    w.admin_notes
FROM withdrawals w
JOIN profiles p ON w.user_id = p.user_id
WHERE w.status = 'pending'
ORDER BY w.created_at DESC;
```

### Update Status Withdrawal (Approve)
```sql
UPDATE withdrawals 
SET 
    status = 'approved',
    processed_by = '<admin_user_id>',
    processed_at = NOW(),
    admin_notes = 'Withdrawal disetujui dan sedang diproses'
WHERE id = '<withdrawal_id>';
```

### Mark as Completed dengan Transaction Hash
```sql
UPDATE withdrawals 
SET 
    status = 'completed',
    processed_at = NOW(),
    transaction_hash = '0x1234567890abcdef...',
    admin_notes = 'Transfer berhasil via TRC20'
WHERE id = '<withdrawal_id>';
```

## 🎨 UI Admin (Coming Soon)
Admin Dashboard akan memiliki:
- 📊 Withdrawal Management Page
- ✅ Table dengan filter & search
- 🔍 Detail modal untuk setiap withdrawal
- 📝 Form untuk update status & notes
- 📈 Statistics: Total pending, approved, rejected

## 📱 Notifikasi
- User mendapat notifikasi ketika withdrawal diproses
- Status update: pending → approved → completed
- Email notification (optional)

## 🔐 Security
- Hanya admin yang bisa update withdrawal status
- Semua perubahan ter-log dengan timestamp
- Admin tracking (siapa yang approve/reject)

## 📌 Status Workflow

```
User Submit WD
      ↓
  [PENDING] ← Admin dapat melihat
      ↓
  Admin Process
      ↓
  [APPROVED] ← Admin setujui
      ↓
  Admin Transfer
      ↓
  [COMPLETED] ← Admin tandai selesai + hash
```

## 🚀 Next Steps
1. ✅ Run migration SQL
2. ✅ Build Admin Withdrawal Management Page
3. ✅ Add notification system
4. ✅ Add email alerts

---
**Note**: Semua withdrawal tercatat otomatis untuk pembukuan dan audit trail.
