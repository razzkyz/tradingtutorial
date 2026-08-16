-- =====================================================
-- WITHDRAWAL TRACKING & ADMIN BOOKKEEPING SYSTEM
-- =====================================================
-- File: database-withdrawal-tracking.sql
-- Description: Menambahkan kolom tracking untuk admin bookkeeping
-- =====================================================

-- Menambahkan kolom untuk tracking withdrawal di admin
ALTER TABLE withdrawals 
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS processed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS transaction_hash VARCHAR(255);

-- Menambahkan index untuk performa
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON withdrawals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_status ON withdrawals(user_id, status);

-- Menambahkan comment untuk dokumentasi
COMMENT ON COLUMN withdrawals.admin_notes IS 'Catatan admin untuk pembukuan withdrawal';
COMMENT ON COLUMN withdrawals.processed_by IS 'Admin yang memproses withdrawal ini';
COMMENT ON COLUMN withdrawals.processed_at IS 'Waktu withdrawal diproses oleh admin';
COMMENT ON COLUMN withdrawals.transaction_hash IS 'Hash transaksi blockchain untuk verifikasi';

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Cek struktur table withdrawals yang sudah diupdate
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'withdrawals'
ORDER BY ordinal_position;
