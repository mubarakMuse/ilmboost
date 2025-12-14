import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

function hashValue(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, pin } = body;

    if (!email || !pin) {
      return NextResponse.json(
        { success: false, error: "Email and PIN are required" },
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

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "Invalid email or PIN" },
        { status: 401 }
      );
    }

    // Verify PIN
    const hashedPin = hashValue(pin);
    if (profile.pin !== hashedPin) {
      return NextResponse.json(
        { success: false, error: "Invalid email or PIN" },
        { status: 401 }
      );
    }

    // Calculate expiry (4 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 4);

    // Return user data (without sensitive info)
    // Session will be stored in localStorage on client side
    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        phone: profile.phone,
        dobMonth: profile.dob_month,
        dobYear: profile.dob_year,
        membership: profile.membership,
        createdAt: profile.created_at
      },
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

