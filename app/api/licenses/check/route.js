import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

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

    // Check if user has an active license (owned by them)
    const { data: activeLicense } = await supabase
      .from('licenses')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      .order('purchased_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Also check if user is part of a family/organization license (shared license)
    const { data: licenseMembership } = await supabase
      .from('license_users')
      .select(`
        license_id,
        licenses (
          id,
          license_type,
          license_key,
          status,
          expires_at,
          max_users,
          user_id
        )
      `)
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();
    
    // Check if the shared license is valid (active and not expired)
    let hasValidSharedLicense = false;
    if (licenseMembership?.licenses) {
      const sharedLicense = licenseMembership.licenses;
      
      // Check if license is active
      if (sharedLicense.status !== 'active') {
        hasValidSharedLicense = false;
      } else {
        // Check expiration
        const isExpired = sharedLicense.expires_at && new Date(sharedLicense.expires_at) < new Date();
        if (!isExpired) {
          // Count current users on this license
          const { count } = await supabase
            .from('license_users')
            .select('*', { count: 'exact', head: true })
            .eq('license_id', sharedLicense.id);
          
          // Check if license has available slots (or is organization/unlimited)
          if (sharedLicense.max_users === null || (count || 0) < sharedLicense.max_users) {
            hasValidSharedLicense = true;
          }
        }
      }
    }

    const hasActiveLicense = !!activeLicense || hasValidSharedLicense;
    let license = null;
    
    if (activeLicense) {
      // User owns the license
      license = {
        ...activeLicense,
        user_id: activeLicense.user_id
      };
    } else if (hasValidSharedLicense && licenseMembership?.licenses) {
      // User is a member of a shared license
      license = {
        ...licenseMembership.licenses,
        isMember: true,
        user_id: licenseMembership.licenses.user_id, // Include owner ID to check if user is owner
        license_key: licenseMembership.licenses.license_key // Include license key
      };
    }

    // Debug logging (remove in production if needed)
 

    return NextResponse.json({ 
      success: true,
      hasLicense: hasActiveLicense,
      license: license || null
    });
  } catch (error) {
    console.error('Check license error:', error);
    return NextResponse.json(
      { success: false, error: "Failed to check license" },
      { status: 500 }
    );
  }
}

