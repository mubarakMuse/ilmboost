# Fix Payment Errors - Database Migration Required

## Issues Found

1. **Database Schema Missing Stripe Columns**
   - Error: `Could not find the 'stripe_customer_id' column`
   - The columns exist in the schema file but not in the actual database

2. **User Not Found in Verify Session**
   - Error: `404 "User not found"`
   - User lookup failing in verify-session API

## Solutions Applied

### 1. Code Fixes
- ✅ Webhook now handles missing Stripe columns gracefully
- ✅ Falls back to updating membership only if Stripe columns don't exist
- ✅ Better error handling for missing customer data
- ✅ Verify-session improved error handling

### 2. Database Migration Required

**You need to run the migration script to add Stripe columns:**

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the migration script: `add-stripe-columns.sql`

Or run this SQL directly:

```sql
-- Add Stripe columns if they don't exist
DO $$ 
BEGIN
  -- Add stripe_customer_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN stripe_customer_id TEXT;
  END IF;

  -- Add stripe_price_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'stripe_price_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN stripe_price_id TEXT;
  END IF;

  -- Add stripe_subscription_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN stripe_subscription_id TEXT;
  END IF;
END $$;

-- Create index for Stripe customer lookup
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);
```

## After Running Migration

1. **Restart your Next.js dev server** to clear any schema cache
2. **Test payment flow again**
3. **Check logs** - webhook should now update membership successfully

## Current Behavior

- ✅ Webhook will update membership even if Stripe columns don't exist
- ✅ Membership updates will work (Stripe columns are optional for now)
- ✅ After migration, Stripe customer/subscription IDs will be stored

## Testing

After migration:
1. Make a test payment
2. Check webhook logs - should see "Membership updated to monthly/yearly"
3. Check database - user's membership should be updated
4. Success page should work correctly

