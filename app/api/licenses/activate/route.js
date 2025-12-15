import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Activate a license by license key
 * POST /api/licenses/activate
 * Body: { userId, licenseKey }
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, licenseKey } = body;

    if (!userId || !licenseKey) {
      return NextResponse.json(
        { success: false, error: "User ID and license key are required" },
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

    // Find license by license key
    const { data: license, error: licenseError } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', licenseKey.toUpperCase().trim())
      .maybeSingle();

    if (licenseError || !license) {
      return NextResponse.json(
        { success: false, error: "Invalid license key" },
        { status: 404 }
      );
    }

    // Check if license is active
    if (license.status !== 'active') {
      return NextResponse.json(
        { success: false, error: "License is not active" },
        { status: 400 }
      );
    }

    // Check if license has expired
    if (license.expires_at) {
      const expiresAt = new Date(license.expires_at);
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { success: false, error: "License has expired" },
          { status: 400 }
        );
      }
    }

    // Check if user is already the owner
    if (license.user_id === userId) {
      return NextResponse.json(
        { success: false, error: "You are already the owner of this license" },
        { status: 400 }
      );
    }

    // Check if user is already added to this license
    const { data: existing } = await supabase
      .from('license_users')
      .select('*')
      .eq('license_id', license.id)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, error: "You are already using this license" },
        { status: 400 }
      );
    }

    // Check if license has available slots
    const { count } = await supabase
      .from('license_users')
      .select('*', { count: 'exact', head: true })
      .eq('license_id', license.id);

    // Count owner as one user
    const totalUsers = (count || 0) + 1;

    if (license.max_users !== null && totalUsers >= license.max_users) {
      return NextResponse.json(
        { success: false, error: "License has reached maximum user limit" },
        { status: 400 }
      );
    }

    // Add user to license
    const { data, error } = await supabase
      .from('license_users')
      .insert({
        license_id: license.id,
        user_id: userId,
        added_by: license.user_id // License owner added them
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding user to license:', error);
      return NextResponse.json(
        { success: false, error: "Failed to activate license" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "License activated successfully",
      license: {
        id: license.id,
        licenseType: license.license_type,
        maxUsers: license.max_users,
        expiresAt: license.expires_at
      }
    });
  } catch (error) {
    console.error('Activate license error:', error);
    return NextResponse.json(
      { success: false, error: "Failed to activate license" },
      { status: 500 }
    );
  }
}

