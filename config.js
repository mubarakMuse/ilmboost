const config = {
  // REQUIRED
  appName: "Ilm Boost",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "Make authentic Islamic knowledge more accessible. Ilm Boost offers comprehensive online Islamic studies courses for every Muslim learner.",
  // REQUIRED (no https://, not trialing slash at the end, just the naked domain)
  domainName: "ilmboost.com",
  crisp: {
    // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (resend.supportEmail) otherwise customer support won't work.
    id: "",
    // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
    onlyShowOnRoutes: ["/"],
  },
  stripe: {
    // License-based plans - recurring subscriptions
    licenses: [
      {
        // REQUIRED — Stripe Price ID for single user license (recurring annual)
        priceId: "price_1SeezIPDopHPTzRnNZljrG6p", // TODO: Create in Stripe dashboard - Single User $50/year recurring
        // REQUIRED - License type identifier
        type: "single",
        // REQUIRED - Name of the license, displayed on the pricing page
        name: "Single User",
        // A friendly description of the license
        description: "Perfect for individual learners - annual subscription",
        // The price you want to display
        price: 50,
        // Billing period
        billingPeriod: "year",
        // Maximum number of users for this license
        maxUsers: 1,
        // Features list
        features: [
          { name: "Access to all premium courses" },
          { name: "Full course content" },
          { name: "Advanced materials" },
          { name: "Priority support" },
          { name: "Annual subscription (recurring)" },
        ],
      },
      {
        priceId: "price_1SeewtPDopHPTzRnIjb6KFEJ", // TODO: Create in Stripe dashboard - Family/Group $120/year recurring
        type: "family",
        name: "Family/Group",
        description: "Up to 10 users - great value for families and small groups",
        price: 120,
        priceAnchor: 500, // Show $500 crossed out (10 * $50)
        billingPeriod: "year",
        maxUsers: 10,
        features: [
          { name: "Access for up to 10 users" },
          { name: "All premium courses included" },
          { name: "Full course content" },
          { name: "Advanced materials" },
          { name: "Priority support" },
          { name: "Annual subscription (recurring)" },
          { name: "Save $380 vs individual licenses" },
        ],
      },
      {
        priceId: "", // Contact admin for custom pricing
        type: "organization",
        name: "Organization/Large Group",
        description: "Custom pricing for schools, organizations, and large groups",
        price: 0, // Contact for pricing
        billingPeriod: "year",
        maxUsers: null, // Unlimited or custom
        features: [
          { name: "Custom user limit" },
          { name: "All premium courses included" },
          { name: "Bulk licensing discounts" },
          { name: "Dedicated support" },
          { name: "Custom terms available" },
          { name: "Contact admin for pricing" },
        ],
      },
    ],
  },
  aws: {
    // If you use AWS S3/Cloudfront, put values in here
    bucket: "bucket-name",
    bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
    cdn: "https://cdn-id.cloudfront.net/",
  },
  resend: {
    // REQUIRED — Email 'From' field to be used when sending magic login links
    fromNoReply: `Ilm Boost <mubarak014@gmail.com>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `Ilm Boost <mubarak014@gmail.com>`,
    // Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "mubarak014@gmail.com",
  },
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode).
    theme: "light",
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..).
    // Updated to match custom color palette
    main: "#4A463F",
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/signin",
    // REQUIRED — the path you want to redirect users after successfull login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/dashboard",
  },
};

export default config;
