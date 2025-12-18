import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, firstName, lastName, phone, dobMonth, dobYear } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    if (!firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: "First name and last name are required" },
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

    // Build update object
    const updateData = {
      first_name: firstName,
      last_name: lastName,
      updated_at: new Date().toISOString()
    };

    // Add optional fields if provided
    if (phone !== undefined) {
      updateData.phone = phone || null;
    }
    if (dobMonth !== undefined) {
      updateData.dob_month = dobMonth || null;
    }
    if (dobYear !== undefined) {
      updateData.dob_year = dobYear || null;
    }

    // Update profile
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update profile" },
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
        membership: profile.membership,
        createdAt: profile.created_at
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

