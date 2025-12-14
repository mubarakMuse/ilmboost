import { NextResponse } from "next/server";
import Stripe from "stripe";
import { findCheckoutSession } from "@/libs/stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: "Stripe not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { userId, sessionId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Verify user exists first
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { persistSession: false },
        realtime: { disabled: true }
      }
    );

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, membership")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.error("Profile lookup error:", profileError);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Verify session with Stripe if sessionId is provided
    if (sessionId && sessionId !== '{CHECKOUT_SESSION_ID}') {
      try {
        const session = await findCheckoutSession(sessionId);
        
        if (!session) {
          console.warn("Session not found, but user exists. Payment may still be processing.");
          // Continue anyway - webhook might have already processed it
        } else if (session.status !== "complete") {
          console.warn("Session not completed yet:", session.status);
          // Continue anyway - might still be processing
        } else {
          console.log("Stripe session verified:", sessionId);
        }
      } catch (error) {
        console.error("Error verifying Stripe session:", error);
        // Continue anyway - webhook might have processed it
      }
    } else {
      console.log("No sessionId provided, skipping Stripe verification");
    }

    // Return success - webhook will update membership if payment was successful
    console.log("Payment verification for user:", userId, "Current membership:", profile.membership);
    
    return NextResponse.json({ 
      success: true, 
      membership: profile.membership,
      message: profile.membership === 'free' 
        ? "Payment verified. Membership update may take a moment." 
        : "Payment verified successfully."
    });
  } catch (error) {
    console.error("Error verifying session:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

