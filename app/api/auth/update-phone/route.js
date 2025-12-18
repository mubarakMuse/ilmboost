import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, phone } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
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

    // Update phone number
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({ phone: phone || null })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Phone update error:', updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update phone number" },
        { status: 500 }
      );
    }

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
        membership: profile.membership
      }
    });
  } catch (error) {
    console.error('Update phone error:', error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

