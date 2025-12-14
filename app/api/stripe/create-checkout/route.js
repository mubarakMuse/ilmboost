import { createCheckout } from "@/libs/stripe";
import { NextResponse } from "next/server";
import config from "@/config";

// This function is used to create a Stripe Checkout Session for membership subscription
export async function POST(req) {
  const body = await req.json();

  if (!body.email && !body.userId) {
    return NextResponse.json(
      { error: "Email or User ID is required" },
      { status: 400 }
    );
  }

  // Check if Stripe is configured
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables." },
      { status: 500 }
    );
  }

  try {
    // Get the price ID from request body or use the first plan
    let priceId = body.priceId;
    
    // If no priceId provided, use Monthly plan as default
    if (!priceId) {
      const monthlyPlan = config.stripe.plans.find(plan => plan.name === "Monthly");
      priceId = monthlyPlan?.priceId || config.stripe.plans[0]?.priceId;
    }
    
    if (!priceId) {
      return NextResponse.json(
        { error: "No price ID found. Please select a plan." },
        { status: 400 }
      );
    }

    // Determine membership tier from priceId
    const plan = config.stripe.plans.find(p => p.priceId === priceId);
    const membershipTier = plan?.name === "Yearly" ? "yearly" : plan?.name === "Monthly" ? "monthly" : "paid";

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : `https://${config.domainName}`);
    
    // Use userId if provided, otherwise use email
    const clientReferenceId = body.userId || body.email;
    
    const stripeSessionURL = await createCheckout({
      priceId,
      mode: "subscription",
      successUrl: `${baseUrl}/api/stripe/success?userId=${encodeURIComponent(clientReferenceId)}&membership=${membershipTier}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/membership`,
      clientReferenceId: clientReferenceId, // Use userId or email as reference
      user: {
        email: body.email,
      },
    });

    return NextResponse.json({ url: stripeSessionURL });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "Failed to create checkout session" }, { status: 500 });
  }
}
