import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Simple hash function for PIN and secret answer (not for production - use bcrypt in production)
function hashValue(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, firstName, lastName, phone, dobMonth, dobYear, pin, secretAnswer, membership } = body;

    if (!email || !firstName || !lastName || !pin || !secretAnswer) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
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

    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: "Email already registered. Please login instead." },
        { status: 400 }
      );
    }

    // Create auth user first (using email as password temporarily, we'll use custom auth)
    // For custom PIN-based auth, we'll skip Supabase auth and use our own
    const userId = crypto.randomUUID();

    // Insert profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email.toLowerCase(),
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        dob_month: dobMonth || null,
        dob_year: dobYear || null,
        pin: hashValue(pin),
        secret_answer: hashValue(secretAnswer),
        membership: membership || 'free'
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return NextResponse.json(
        { success: false, error: "Failed to create account" },
        { status: 500 }
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
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

