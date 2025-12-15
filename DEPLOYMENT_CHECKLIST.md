# Deployment Checklist for IlmBoost

## Pre-Deployment Checklist

### ✅ Build Verification
- [x] Build completes successfully (`npm run build`)
- [x] No linting errors (`npm run lint`)
- [x] All pages generate correctly

### 🔐 Environment Variables Required

Make sure these are set in your deployment platform (Netlify/Vercel/etc.):

#### Required Variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx (or sk_test_xxx for testing)
STRIPE_PUBLIC_KEY=pk_live_xxx (or pk_test_xxx for testing)
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Site URL (for sitemap)
SITE_URL=https://ilmboost.com

# Resend (if using email)
RESEND_API_KEY=re_xxx
```

### 📊 Database Setup

1. **Run Supabase Migrations:**
   - Execute `supabase-schema.sql` in Supabase SQL Editor
   - Execute `add-licenses-table.sql` in Supabase SQL Editor
   - Execute `add-subscription-id-to-licenses.sql` in Supabase SQL Editor
   - Execute `update-license-key-generation.sql` in Supabase SQL Editor

2. **Verify Tables Created:**
   - `profiles` - User accounts
   - `licenses` - License information
   - `license_users` - License-user relationships
   - `course_enrollments` - Course enrollments
   - `course_progress` - Learning progress
   - `quiz_scores` - Quiz scores

### 🔗 Stripe Configuration

1. **Create Products & Prices in Stripe Dashboard:**
   - Single User License: $50/year (recurring)
   - Family/Group License: $120/year (recurring)
   - Update `priceId` values in `config.js` with actual Stripe Price IDs

2. **Set Up Webhook:**
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://ilmboost.com/api/webhook/stripe`
   - Select events:
     - `checkout.session.completed`
     - `invoice.paid`
     - `customer.subscription.deleted`
   - Copy the webhook signing secret → Add to `STRIPE_WEBHOOK_SECRET`

### 🌐 Domain Configuration

1. **Update Domain in Config:**
   - `config.js` → `domainName: "ilmboost.com"`
   - `next-sitemap.config.js` → `siteUrl: "https://ilmboost.com"`

2. **DNS Settings (if using Cloudflare):**
   - Point A/CNAME records to your hosting provider
   - Ensure SSL/TLS is enabled

### 📝 Content Verification

- [ ] Blog articles have proper images (currently using placeholders)
- [ ] Course images are accessible
- [ ] All course content is complete
- [ ] Terms of Service page is updated
- [ ] Privacy Policy page is updated

### 🔍 Final Checks

- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test license purchase flow
- [ ] Test license activation
- [ ] Test course enrollment
- [ ] Test quiz functionality
- [ ] Test progress tracking
- [ ] Verify Stripe webhook receives events
- [ ] Test on mobile devices
- [ ] Check all links work
- [ ] Verify images load correctly

### 🚀 Deployment Steps

1. **Push to Git:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Platform:**
   - Netlify: Auto-deploys from Git
   - Vercel: Auto-deploys from Git
   - Other: Follow platform-specific instructions

3. **Post-Deployment:**
   - Verify site loads at `https://ilmboost.com`
   - Test critical user flows
   - Monitor error logs
   - Check Stripe webhook logs

### ⚠️ Important Notes

- **Middleware Warning:** The build shows a deprecation warning about middleware. This is non-critical but consider updating to "proxy" convention in the future.
- **Image Optimization:** Ensure course images are optimized for web
- **Performance:** Monitor Core Web Vitals after deployment
- **Security:** Ensure all API routes have proper error handling
- **Backup:** Keep database backups before major deployments

### 🐛 Troubleshooting

**Build Fails:**
- Check all environment variables are set
- Verify Node.js version matches `.nvmrc` (if present)
- Check for TypeScript errors

**Webhook Not Working:**
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
- Check webhook endpoint URL is correct
- Review webhook logs in Stripe Dashboard

**Database Errors:**
- Verify all migrations have been run
- Check RLS policies are correct
- Ensure service role key has proper permissions

### 📞 Support

If you encounter issues:
1. Check deployment platform logs
2. Check Stripe webhook logs
3. Check Supabase logs
4. Review browser console for client-side errors

---

**Last Updated:** January 2025
**Next.js Version:** 16.0.10
**React Version:** 19.0.0

