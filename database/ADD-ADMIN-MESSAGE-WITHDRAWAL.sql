-- Add admin_message column to withdrawals table
-- This allows admin to customize the notification message for each withdrawal

ALTER TABLE withdrawals
ADD COLUMN IF NOT EXISTS admin_message TEXT DEFAULT 'Your transaction is being processed. Please wait for 5 minutes.';

-- Update existing records with default message
UPDATE withdrawals 
SET admin_message = 'Your transaction is being processed. Please wait for 5 minutes.'
WHERE admin_message IS NULL;
