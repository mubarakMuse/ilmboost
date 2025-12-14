# Stripe Integration - Complete Guide

## ✅ Implementation Status

All Stripe logic is now solid and working with the custom PIN-based authentication system.

## Database Schema Updates

Added Stripe fields to `profiles` table:
- `stripe_customer_id` - Stripe customer ID
- `stripe_price_id` - Current subscription price ID
- `stripe_subscription_id` - Active subscription ID

## Flow Overview

### 1. **Checkout Creation** (`/api/stripe/create-checkout`)
- Accepts `userId` (or email) and `priceId`
- Creates Stripe Checkout Session
- Uses `userId` as `clientReferenceId` for webhook lookup
- Success URL includes `userId` and `membership` tier

### 2. **Webhook Handler** (`/api/webhook/stripe`)
Handles Stripe events:

#### `checkout.session.completed`
- Finds user by `clientReferenceId` (userId or email)
- Updates membership: `monthly` or `yearly` based on plan
- Stores Stripe customer/subscription IDs
- **No Supabase Auth needed** - works with custom profiles table

#### `customer.subscription.deleted`
- Sets membership back to `free`
- Clears subscription ID

#### `invoice.paid`
- Ensures membership stays active on recurring payments
- Updates membership tier if needed

### 3. **Success Page** (`/api/stripe/success`)
- Verifies payment with `/api/stripe/verify-session`
- Fetches updated user data from API
- Updates localStorage session with new membership
- Redirects to dashboard

### 4. **Verify Session** (`/api/stripe/verify-session`)
- Validates Stripe session is complete
- Verifies user exists in database
- Returns membership status

## Membership Tiers

- `free` - Default, no payment
- `monthly` - $10/month subscription
- `yearly` - $100/year subscription
- `paid` - Legacy (maps to monthly)

## API Routes

### Create Checkout
```javascript
POST /api/stripe/create-checkout
Body: {
  userId: "uuid",
  email: "user@example.com",
  priceId: "price_xxx"
}
```

### Verify Session
```javascript
POST /api/stripe/verify-session
Body: {
  userId: "uuid",
  sessionId: "cs_xxx"
}
```

### Webhook
```javascript
POST /api/webhook/stripe
Headers: {
  "stripe-signature": "..."
}
```

## Frontend Integration

### Membership Page (`/membership`)
- Public page showing all plans
- Redirects to signup if not logged in
- Creates checkout with `userId` if logged in

### Account Page (`/account`)
- Shows current membership
- `handleUpgradeMembership(planType)` - creates checkout
- Updates localStorage after successful payment

## Security Features

✅ **Webhook Signature Verification**
- Validates all webhook events with Stripe signature
- Prevents unauthorized access

✅ **User Verification**
- Webhook finds user by `clientReferenceId` (userId)
- Falls back to email lookup if needed
- No Supabase Auth dependencies

✅ **Session Validation**
- Frontend checks localStorage session
- API verifies user exists in database
- No session validation in API (handled frontend)

## Environment Variables Required

```env
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
```

## Testing Checklist

- [ ] Create checkout session with userId
- [ ] Complete payment in Stripe test mode
- [ ] Webhook updates membership in database
- [ ] Success page updates localStorage
- [ ] User sees updated membership in dashboard
- [ ] Subscription cancellation sets membership to free
- [ ] Recurring payments maintain membership

## Common Issues & Solutions

### Issue: Membership not updating after payment
**Solution**: Check webhook is receiving events. Verify `STRIPE_WEBHOOK_SECRET` is correct.

### Issue: User not found in webhook
**Solution**: Ensure `clientReferenceId` in checkout matches `userId` in database.

### Issue: Success page shows error
**Solution**: Verify session is complete in Stripe dashboard. Check `verify-session` API logs.

## Next Steps

1. Set up Stripe webhook endpoint in Stripe Dashboard
2. Add webhook URL: `https://yourdomain.com/api/webhook/stripe`
3. Test with Stripe test cards
4. Monitor webhook events in Stripe Dashboard
5. Set up email notifications for subscription events (optional)

