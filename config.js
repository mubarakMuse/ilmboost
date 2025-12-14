const config = {
  // REQUIRED
  appName: "Ilm Boost",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "The complete Online Learning Experience For every Muslim.",
  // REQUIRED (no https://, not trialing slash at the end, just the naked domain)
  domainName: "ilmboost.com",
  crisp: {
    // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (resend.supportEmail) otherwise customer support won't work.
    id: "",
    // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
    onlyShowOnRoutes: ["/"],
  },
  stripe: {
    // Create multiple plans in your Stripe dashboard, then add them here. You can add as many plans as you want, just make sure to add the priceId
    plans: [
      {
        // REQUIRED — we use this to find the plan in the webhook (for instance if you want to update the user's credits based on the plan)
        priceId: "price_1Se86WPDopHPTzRnRXsPLijv", // Monthly $10
        //  REQUIRED - Name of the plan, displayed on the pricing page
        name: "Monthly",
        // A friendly description of the plan, displayed on the pricing page. Tip: explain why this plan and not others
        description: "Full access to all courses - billed monthly",
        // The price you want to display, the one user will be charged on Stripe.
        price: 10,
        // If you have an anchor price (i.e. $29) that you want to display crossed out, put it here. Otherwise, leave it empty
        priceAnchor: 0,
        features: [
          { name: "Access to all courses" },
          { name: "Full course content" },
          { name: "Advanced materials" },
          { name: "Priority support" },
          { name: "Exclusive content" },
        ],
      },
      {
        priceId: "price_1Se883PDopHPTzRncqkzihUI", // Yearly $100
        name: "Yearly",
        description: "Full access to all courses - best value, billed annually",
        price: 100,
        priceAnchor: 120, // Show $120 crossed out (10*12)
        features: [
          { name: "Access to all courses" },
          { name: "Full course content" },
          { name: "Advanced materials" },
          { name: "Priority support" },
          { name: "Exclusive content" },
          { name: "Save $20 per year" },
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
    fromAdmin: `Marc at ShipFast <marc@resend.shipfa.st>`,
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
