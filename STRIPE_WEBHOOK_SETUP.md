# Stripe Webhook Setup Guide

## Local Development

### Using Stripe CLI

1. **Install Stripe CLI** (if not already installed):
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **Login to Stripe CLI**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to your local server**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook/stripe
   ```

4. **Copy the webhook signing secret** that appears after running the command. It will look like:
   ```
   > Ready! Your webhook signing secret is whsec_xxxxx
   ```

5. **Add the webhook secret to your `.env.local`**:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

6. **Restart your Next.js dev server** to load the new environment variable.

### Testing Webhooks

1. Make sure your Next.js server is running on port 3000
2. Make sure Stripe CLI is forwarding to `localhost:3000/api/webhook/stripe`
3. Complete a test payment in your app
4. Check the Stripe CLI output for webhook events
5. Check your Next.js server logs for webhook processing

## Production Setup

### Stripe Dashboard Configuration

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/webhook/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copy the "Signing secret" (starts with `whsec_`)
6. Add it to your production environment variables as `STRIPE_WEBHOOK_SECRET`

## Troubleshooting

### Issue: "connection refused" errors
**Solution**: Make sure:
- Your Next.js server is running on port 3000
- The Stripe CLI command points to the correct URL: `localhost:3000/api/webhook/stripe`
- No firewall is blocking the connection

### Issue: Webhook signature verification failed
**Solution**: 
- Make sure `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe CLI or Dashboard
- Restart your Next.js server after updating the secret

### Issue: Webhooks not updating membership
**Solution**:
- Check webhook logs in Stripe Dashboard
- Check your Next.js server logs for errors
- Verify the webhook handler is receiving events
- Check that `clientReferenceId` matches a user ID in your database

## Current Webhook Events Handled

1. **checkout.session.completed** - Updates membership when payment succeeds
2. **customer.subscription.deleted** - Sets membership to 'free' when subscription cancelled
3. **invoice.paid** - Maintains membership on recurring payments

