import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createCustomerPortal } from "@/libs/stripe";

export async function POST(req) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { persistSession: false },
        realtime: { disabled: true }
      }
    );

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        {
          error:
            "You don't have a billing account yet. Purchase a license first.",
        },
        { status: 400 }
      );
    }

    const stripePortalUrl = await createCustomerPortal({
      customerId: profile.stripe_customer_id,
      returnUrl: body.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account`,
    });

    if (!stripePortalUrl) {
      return NextResponse.json(
        { error: "Failed to create portal session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: stripePortalUrl,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
