import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { persistSession: false },
        realtime: { disabled: true }
      }
    );

    // Get all users
    const { data: allUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, membership, created_at, stripe_customer_id')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    // Get enrollments
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('course_enrollments')
      .select('*');

    // Get course progress
    const { data: progress, error: progressError } = await supabase
      .from('course_progress')
      .select('*');

    // Get quiz scores
    const { data: quizScores, error: quizScoresError } = await supabase
      .from('quiz_scores')
      .select('*');

    // Get licenses
    const { data: licenses, error: licensesError } = await supabase
      .from('licenses')
      .select('*')
      .order('purchased_at', { ascending: false });

    // Get license users
    const { data: licenseUsers, error: licenseUsersError } = await supabase
      .from('license_users')
      .select('*');

    // Calculate statistics
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Sign-ups over time
    const signUpsToday = allUsers?.filter(user => {
      const createdAt = new Date(user.created_at);
      return createdAt >= today;
    }).length || 0;

    const signUpsThisWeek = allUsers?.filter(user => {
      const createdAt = new Date(user.created_at);
      return createdAt >= weekAgo;
    }).length || 0;

    const signUpsThisMonth = allUsers?.filter(user => {
      const createdAt = new Date(user.created_at);
      return createdAt >= monthAgo;
    }).length || 0;

    // Sign-ups by day (last 30 days)
    const signUpsByDay = {};
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    allUsers?.forEach(user => {
      const createdAt = new Date(user.created_at);
      if (createdAt >= thirtyDaysAgo) {
        const dateKey = createdAt.toISOString().split('T')[0];
        signUpsByDay[dateKey] = (signUpsByDay[dateKey] || 0) + 1;
      }
    });

    // Membership breakdown
    const membershipBreakdown = {};
    allUsers?.forEach(user => {
      const membership = user.membership || 'free';
      membershipBreakdown[membership] = (membershipBreakdown[membership] || 0) + 1;
    });

    // Users with Stripe subscriptions
    const paidUsers = allUsers?.filter(user => user.stripe_customer_id).length || 0;

    // Course enrollment stats
    const totalEnrollments = enrollments?.length || 0;
    const uniqueEnrolledUsers = new Set(enrollments?.map(e => e.user_id)).size;
    
    // Enrollment by course
    const enrollmentsByCourse = {};
    enrollments?.forEach(enrollment => {
      enrollmentsByCourse[enrollment.course_id] = (enrollmentsByCourse[enrollment.course_id] || 0) + 1;
    });

    // Course progress stats
    const totalProgressRecords = progress?.length || 0;
    const usersWithProgress = new Set(progress?.map(p => p.user_id)).size;
    
    // Average completion rate
    let totalCompletedSections = 0;
    progress?.forEach(p => {
      totalCompletedSections += (p.completed_sections?.length || 0);
    });

    // Quiz stats
    const totalQuizScores = quizScores?.length || 0;
    const averageQuizScore = quizScores && quizScores.length > 0
      ? Math.round(quizScores.reduce((sum, score) => sum + score.score, 0) / quizScores.length)
      : 0;

    // Recent sign-ups (last 10)
    const recentSignUps = allUsers?.slice(0, 10).map(user => ({
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      membership: user.membership,
      createdAt: user.created_at
    })) || [];

    // License statistics
    const totalLicenses = licenses?.length || 0;
    const activeLicenses = licenses?.filter(license => {
      if (license.status !== 'active') return false;
      if (!license.expires_at) return true; // Lifetime license
      return new Date(license.expires_at) >= new Date();
    }).length || 0;
    const expiredLicenses = licenses?.filter(license => {
      if (license.status === 'expired') return true;
      if (license.status === 'active' && license.expires_at) {
        return new Date(license.expires_at) < new Date();
      }
      return false;
    }).length || 0;
    const revokedLicenses = licenses?.filter(license => license.status === 'revoked').length || 0;

    // Licenses by type
    const licensesByType = {};
    licenses?.forEach(license => {
      const type = license.license_type || 'unknown';
      licensesByType[type] = (licensesByType[type] || 0) + 1;
    });

    // Total license users
    const totalLicenseUsers = licenseUsers?.length || 0;
    const uniqueLicenseUsers = new Set(licenseUsers?.map(lu => lu.user_id)).size;

    // Licenses purchased this month
    const licensesThisMonth = licenses?.filter(license => {
      const purchasedAt = new Date(license.purchased_at);
      return purchasedAt >= monthAgo;
    }).length || 0;

    // Recent licenses (last 10)
    const recentLicenses = licenses?.slice(0, 10).map(license => ({
      id: license.id,
      licenseKey: license.license_key,
      licenseType: license.license_type,
      status: license.status,
      maxUsers: license.max_users,
      purchasedAt: license.purchased_at,
      expiresAt: license.expires_at,
      userId: license.user_id
    })) || [];

    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: allUsers?.length || 0,
          signUpsToday,
          signUpsThisWeek,
          signUpsThisMonth,
          paidUsers,
          signUpsByDay,
          membershipBreakdown
        },
        enrollments: {
          total: totalEnrollments,
          uniqueUsers: uniqueEnrolledUsers,
          byCourse: enrollmentsByCourse
        },
        progress: {
          totalRecords: totalProgressRecords,
          usersWithProgress,
          totalCompletedSections
        },
        quizzes: {
          totalScores: totalQuizScores,
          averageScore: averageQuizScore
        },
        licenses: {
          total: totalLicenses,
          active: activeLicenses,
          expired: expiredLicenses,
          revoked: revokedLicenses,
          byType: licensesByType,
          totalUsers: totalLicenseUsers,
          uniqueUsers: uniqueLicenseUsers,
          purchasedThisMonth: licensesThisMonth,
          recentLicenses
        },
        recentSignUps
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

