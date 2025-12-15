import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Leave a license (remove user from license_users table)
 * POST /api/licenses/leave
 * Body: { userId, licenseId }
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, licenseId } = body;

    if (!userId || !licenseId) {
      return NextResponse.json(
        { success: false, error: "User ID and license ID are required" },
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

    // Verify user is not the license owner (owners can't leave, they must cancel subscription)
    const { data: license } = await supabase
      .from('licenses')
      .select('user_id')
      .eq('id', licenseId)
      .maybeSingle();

    if (!license) {
      return NextResponse.json(
        { success: false, error: "License not found" },
        { status: 404 }
      );
    }

    if (license.user_id === userId) {
      return NextResponse.json(
        { success: false, error: "License owners cannot leave. Please cancel your subscription instead." },
        { status: 400 }
      );
    }

    // Remove user from license
    const { error } = await supabase
      .from('license_users')
      .delete()
      .eq('license_id', licenseId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error leaving license:', error);
      return NextResponse.json(
        { success: false, error: "Failed to leave license" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "Successfully left license"
    });
  } catch (error) {
    console.error('Leave license error:', error);
    return NextResponse.json(
      { success: false, error: "Failed to leave license" },
      { status: 500 }
    );
  }
}

