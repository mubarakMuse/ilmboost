import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import config from "@/config";

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, licenseType } = body;

    if (!userId || !licenseType) {
      return NextResponse.json(
        { success: false, error: "User ID and license type required" },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: "Stripe not configured" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-08-16",
    });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { persistSession: false },
        realtime: { disabled: true }
      }
    );

    // Verify user exists
    const { data: user } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .maybeSingle();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Get license config from config.js
    const licenseConfig = config.stripe.licenses.find(l => l.type === licenseType);
    
    if (!licenseConfig) {
      return NextResponse.json(
        { success: false, error: "Invalid license type" },
        { status: 400 }
      );
    }

    // Organization licenses require admin contact
    if (licenseType === 'organization' || !licenseConfig.priceId) {
      return NextResponse.json({
        success: false,
        error: "Please contact admin for organization pricing",
        requiresContact: true
      });
    }

    // Validate priceId is not empty
    if (!licenseConfig.priceId || licenseConfig.priceId.trim() === '') {
      return NextResponse.json(
        { success: false, error: "License pricing not configured. Please contact support." },
        { status: 500 }
      );
    }

    // Create Stripe checkout session (recurring subscription)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: licenseConfig.priceId, // Use priceId from config
          quantity: 1,
        },
      ],
      mode: 'subscription', // Recurring subscription for licenses
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stripe/success?userId=${userId}&licenseType=${licenseType}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/membership?canceled=true`,
      client_reference_id: userId,
      metadata: {
        userId,
        licenseType,
        type: 'license'
      }
    });

    return NextResponse.json({ 
      success: true, 
      url: session.url,
      sessionId: session.id
    });
  } catch (error) {
    console.error('License purchase error:', error);
    return NextResponse.json(
      { success: false, error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

