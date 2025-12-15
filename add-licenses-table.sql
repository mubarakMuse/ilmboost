-- Migration: Add licenses table for license-based access
-- Run this in your Supabase SQL Editor

-- Licenses table
CREATE TABLE IF NOT EXISTS public.licenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  license_type TEXT NOT NULL CHECK (license_type IN ('single', 'family', 'organization')),
  license_key TEXT UNIQUE NOT NULL, -- Unique license key/code
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  max_users INTEGER DEFAULT 1, -- 1 for single, 10 for family, custom for organization
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL for lifetime, or set expiration date
  activated_at TIMESTAMPTZ,
  -- Stripe fields
  stripe_payment_intent_id TEXT,
  stripe_customer_id TEXT,
  stripe_price_id TEXT,
  stripe_subscription_id TEXT, -- For recurring subscriptions
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- License users table (for family/organization licenses)
CREATE TABLE IF NOT EXISTS public.license_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  license_id UUID REFERENCES public.licenses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  added_by UUID REFERENCES public.profiles(id), -- User who added this member
  UNIQUE(license_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_licenses_user_id ON public.licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_license_key ON public.licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON public.licenses(status);
CREATE INDEX IF NOT EXISTS idx_license_users_license_id ON public.license_users(license_id);
CREATE INDEX IF NOT EXISTS idx_license_users_user_id ON public.license_users(user_id);

-- Enable RLS
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role can manage licenses" ON public.licenses
  FOR ALL USING (true);

CREATE POLICY "Service role can manage license_users" ON public.license_users
  FOR ALL USING (true);

-- Function to generate license key from user info
-- Format: FirstInitial + LastInitial + Last4DigitsOfPhone + YearOfBirth
-- Example: MF12341990 (M=First initial, F=Last initial, 1234=phone last 4, 1990=birth year)
CREATE OR REPLACE FUNCTION generate_license_key(user_first_name TEXT, user_last_name TEXT, user_phone TEXT, user_dob_year INTEGER)
RETURNS TEXT AS $$
DECLARE
  new_key TEXT;
  first_initial TEXT;
  last_initial TEXT;
  phone_last4 TEXT;
  birth_year TEXT;
  key_exists BOOLEAN;
BEGIN
  -- Get first initial (uppercase)
  first_initial := UPPER(SUBSTRING(COALESCE(user_first_name, '') FROM 1 FOR 1));
  IF first_initial = '' THEN first_initial := 'X'; END IF;
  
  -- Get last initial (uppercase)
  last_initial := UPPER(SUBSTRING(COALESCE(user_last_name, '') FROM 1 FOR 1));
  IF last_initial = '' THEN last_initial := 'X'; END IF;
  
  -- Get last 4 digits of phone (remove all non-digits first)
  phone_last4 := SUBSTRING(REGEXP_REPLACE(COALESCE(user_phone, ''), '[^0-9]', '', 'g') FROM GREATEST(1, LENGTH(REGEXP_REPLACE(COALESCE(user_phone, ''), '[^0-9]', '', 'g')) - 3));
  IF phone_last4 = '' OR LENGTH(phone_last4) < 4 THEN 
    phone_last4 := LPAD(COALESCE(phone_last4, ''), 4, '0');
  END IF;
  phone_last4 := RIGHT(phone_last4, 4);
  
  -- Get birth year (4 digits)
  birth_year := COALESCE(user_dob_year::TEXT, '0000');
  IF LENGTH(birth_year) < 4 THEN
    birth_year := LPAD(birth_year, 4, '0');
  END IF;
  birth_year := RIGHT(birth_year, 4);
  
  -- Generate base key
  new_key := first_initial || last_initial || phone_last4 || birth_year;
  
  -- Check if key already exists, if so add a number suffix
  SELECT EXISTS(SELECT 1 FROM public.licenses WHERE license_key = new_key) INTO key_exists;
  
  IF key_exists THEN
    -- If key exists, try adding a number suffix (1-99)
    DECLARE
      suffix INTEGER := 1;
      temp_key TEXT;
    BEGIN
      LOOP
        temp_key := new_key || LPAD(suffix::TEXT, 2, '0');
        SELECT EXISTS(SELECT 1 FROM public.licenses WHERE license_key = temp_key) INTO key_exists;
        EXIT WHEN NOT key_exists OR suffix >= 99;
        suffix := suffix + 1;
      END LOOP;
      new_key := temp_key;
    END;
  END IF;
  
  RETURN new_key;
END;
$$ LANGUAGE plpgsql;

-- Note: License key generation is now handled in the application code
-- using user information (first name, last name, phone, birth year)
-- The trigger is removed as we'll generate keys in the webhook/API

-- Trigger for updated_at
CREATE TRIGGER update_licenses_updated_at BEFORE UPDATE ON public.licenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

