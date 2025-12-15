-- Migration: Add stripe_subscription_id column to licenses table
-- Run this if you already created the licenses table without this column

ALTER TABLE public.licenses 
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

CREATE INDEX IF NOT EXISTS idx_licenses_stripe_subscription ON public.licenses(stripe_subscription_id);

