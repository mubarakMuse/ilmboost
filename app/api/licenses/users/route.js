import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Get users for a license (only owner can view)
 * GET /api/licenses/users?licenseId=xxx&userId=xxx
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const licenseId = searchParams.get('licenseId');
    const userId = searchParams.get('userId');

    if (!licenseId || !userId) {
      return NextResponse.json(
        { success: false, error: "License ID and User ID are required" },
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

    // Verify user is the license owner
    const { data: license } = await supabase
      .from('licenses')
      .select('user_id, max_users')
      .eq('id', licenseId)
      .maybeSingle();

    if (!license) {
      return NextResponse.json(
        { success: false, error: "License not found" },
        { status: 404 }
      );
    }

    if (license.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: "Only license owner can view users" },
        { status: 403 }
      );
    }

    // Get all users on this license (excluding the owner who is in licenses.user_id)
    // Use profiles!license_users_user_id_fkey to specify we want the user's profile, not the added_by profile
    // IMPORTANT: Exclude the owner from license_users count since they're already counted as the owner
    const { data: licenseUsers, error } = await supabase
      .from('license_users')
      .select(`
        id,
        user_id,
        added_at,
        profiles!license_users_user_id_fkey (
          id,
          email,
          first_name,
          last_name
        )
      `)
      .eq('license_id', licenseId)
      .neq('user_id', license.user_id) // Exclude the owner from the list
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Error fetching license users:', error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch license users" },
        { status: 500 }
      );
    }

    // Debug logging

    // Get owner info
    const { data: owner } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name')
      .eq('id', license.user_id)
      .maybeSingle();

    return NextResponse.json({ 
      success: true,
      owner: owner,
      users: licenseUsers || [],
      maxUsers: license.max_users,
      currentUsers: (licenseUsers?.length || 0) + 1 // +1 for owner
    });
  } catch (error) {
    console.error('Get license users error:', error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch license users" },
      { status: 500 }
    );
  }
}

