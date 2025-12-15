import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Add a user to a family/organization license
 * POST /api/licenses/add-user
 * Body: { licenseId, userId, addedByUserId }
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { licenseId, userId, addedByUserId } = body;

    if (!licenseId || !userId || !addedByUserId) {
      return NextResponse.json(
        { success: false, error: "License ID, User ID, and Added By User ID are required" },
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

    // Verify the license exists and is active
    const { data: license, error: licenseError } = await supabase
      .from('licenses')
      .select('*')
      .eq('id', licenseId)
      .eq('status', 'active')
      .maybeSingle();

    if (licenseError || !license) {
      return NextResponse.json(
        { success: false, error: "License not found or inactive" },
        { status: 404 }
      );
    }

    // Verify the user adding is the license owner
    if (license.user_id !== addedByUserId) {
      return NextResponse.json(
        { success: false, error: "Only the license owner can add users" },
        { status: 403 }
      );
    }

    // Check if user is already added
    const { data: existing } = await supabase
      .from('license_users')
      .select('*')
      .eq('license_id', licenseId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, error: "User is already added to this license" },
        { status: 400 }
      );
    }

    // Check if license has available slots
    const { count } = await supabase
      .from('license_users')
      .select('*', { count: 'exact', head: true })
      .eq('license_id', licenseId);

    if (license.max_users !== null && (count || 0) >= license.max_users) {
      return NextResponse.json(
        { success: false, error: "License has reached maximum user limit" },
        { status: 400 }
      );
    }

    // Add user to license
    const { data, error } = await supabase
      .from('license_users')
      .insert({
        license_id: licenseId,
        user_id: userId,
        added_by: addedByUserId
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding user to license:', error);
      return NextResponse.json(
        { success: false, error: "Failed to add user to license" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "User added to license successfully"
    });
  } catch (error) {
    console.error('Add user to license error:', error);
    return NextResponse.json(
      { success: false, error: "Failed to add user to license" },
      { status: 500 }
    );
  }
}

