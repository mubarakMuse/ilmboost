-- Migration: Update license key generation to use user info
-- Format: FirstInitial + LastInitial + YearOfBirth
-- Example: MF1990 (M=First initial, F=Last initial, 1990=birth year)
-- Run this in your Supabase SQL Editor

-- Drop old function and trigger
DROP TRIGGER IF EXISTS set_license_key_trigger ON public.licenses;
DROP FUNCTION IF EXISTS set_license_key();
DROP FUNCTION IF EXISTS generate_license_key();

-- Note: License key generation is now handled in application code (webhook)
-- The format is: FirstInitial + LastInitial + YearOfBirth
-- Example: MF1990

