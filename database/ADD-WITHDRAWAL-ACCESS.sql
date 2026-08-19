-- Add withdrawal_access column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS withdrawal_access BOOLEAN DEFAULT false;

-- Update existing users to have withdrawal access enabled by default
UPDATE profiles 
SET withdrawal_access = true 
WHERE role = 'user';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_withdrawal_access 
ON profiles(withdrawal_access);
