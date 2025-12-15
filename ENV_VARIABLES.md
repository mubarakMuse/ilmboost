# Environment Variables Reference

## Required for Production

### Supabase
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Stripe
```env
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Site Configuration
```env
SITE_URL=https://ilmboost.com
```

### Email (Optional - if using Resend)
```env
RESEND_API_KEY=re_xxx
```

## How to Get These Values

### Supabase
1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

### Stripe
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to Developers → API keys
3. Copy:
   - Secret key → `STRIPE_SECRET_KEY`
   - Publishable key → `STRIPE_PUBLIC_KEY`
4. For Webhook Secret:
   - Go to Developers → Webhooks
   - Click on your webhook endpoint
   - Copy "Signing secret" → `STRIPE_WEBHOOK_SECRET`

### Resend (Optional)
1. Go to [resend.com](https://resend.com)
2. Create an account
3. Go to API Keys
4. Create a new API key → `RESEND_API_KEY`

## Setting in Deployment Platforms

### Netlify
1. Go to Site settings → Environment variables
2. Add each variable
3. Redeploy

### Vercel
1. Go to Project settings → Environment Variables
2. Add each variable for Production
3. Redeploy

### Other Platforms
Add these as environment variables in your platform's settings.

