"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to load statistics');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#FAFAFA] py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center py-12">
              <p className="text-gray-600">Loading statistics...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#FAFAFA] py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <p className="text-red-700">Error: {error}</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!stats) {
    return null;
  }

  // Prepare sign-ups chart data (last 30 days)
  const chartData = Object.entries(stats.users.signUpsByDay)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-30);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAFAFA] py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-serif text-black mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">Platform statistics and user insights</p>
          </div>

          {/* User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <div className="text-3xl font-bold text-black mb-2">
                {stats.users.total}
              </div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <div className="text-3xl font-bold text-black mb-2">
                {stats.users.signUpsToday}
              </div>
              <div className="text-sm text-gray-600">Sign-ups Today</div>
            </div>
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <div className="text-3xl font-bold text-black mb-2">
                {stats.users.signUpsThisWeek}
              </div>
              <div className="text-sm text-gray-600">Sign-ups This Week</div>
            </div>
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <div className="text-3xl font-bold text-black mb-2">
                {stats.users.signUpsThisMonth}
              </div>
              <div className="text-sm text-gray-600">Sign-ups This Month</div>
            </div>
          </div>

          {/* Membership & Enrollment Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Membership Breakdown */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Membership Breakdown</h2>
              <div className="space-y-3">
                {Object.entries(stats.users.membershipBreakdown).map(([membership, count]) => (
                  <div key={membership} className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">{membership}</span>
                    <span className="text-lg font-bold">{count}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Paid Users (Stripe)</span>
                    <span className="text-lg font-bold">{stats.users.paidUsers}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enrollment Stats */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Course Enrollments</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Enrollments</span>
                  <span className="text-lg font-bold">{stats.enrollments.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Unique Enrolled Users</span>
                  <span className="text-lg font-bold">{stats.enrollments.uniqueUsers}</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-sm font-medium mb-2">Enrollments by Course:</div>
                  {Object.entries(stats.enrollments.byCourse).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(stats.enrollments.byCourse)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([courseId, count]) => (
                          <div key={courseId} className="flex justify-between items-center text-sm">
                            <span className="truncate">{courseId}</span>
                            <span className="font-semibold">{count}</span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No enrollments yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Progress & Quiz Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Progress Stats */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Course Progress</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Progress Records</span>
                  <span className="text-lg font-bold">{stats.progress.totalRecords}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Users with Progress</span>
                  <span className="text-lg font-bold">{stats.progress.usersWithProgress}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Completed Sections</span>
                  <span className="text-lg font-bold">{stats.progress.totalCompletedSections}</span>
                </div>
              </div>
            </div>

            {/* Quiz Stats */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Quiz Performance</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Quiz Scores</span>
                  <span className="text-lg font-bold">{stats.quizzes.totalScores}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Score</span>
                  <span className="text-lg font-bold">{stats.quizzes.averageScore}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* License Statistics */}
          {stats.licenses && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* License Overview */}
              <div className="bg-white border-2 border-black rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">License Overview</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Licenses</span>
                    <span className="text-lg font-bold">{stats.licenses.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-700">Active</span>
                    <span className="text-lg font-bold text-green-700">{stats.licenses.active}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-orange-700">Expired</span>
                    <span className="text-lg font-bold text-orange-700">{stats.licenses.expired}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-red-700">Revoked</span>
                    <span className="text-lg font-bold text-red-700">{stats.licenses.revoked}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Purchased This Month</span>
                      <span className="text-lg font-bold">{stats.licenses.purchasedThisMonth}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* License Details */}
              <div className="bg-white border-2 border-black rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">License Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total License Users</span>
                    <span className="text-lg font-bold">{stats.licenses.totalUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Unique License Users</span>
                    <span className="text-lg font-bold">{stats.licenses.uniqueUsers}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-sm font-medium mb-2">Licenses by Type:</div>
                    {Object.entries(stats.licenses.byType).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(stats.licenses.byType).map(([type, count]) => (
                          <div key={type} className="flex justify-between items-center text-sm">
                            <span className="capitalize">{type}</span>
                            <span className="font-semibold">{count}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No licenses yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Licenses */}
          {stats.licenses && stats.licenses.recentLicenses && stats.licenses.recentLicenses.length > 0 && (
            <div className="bg-white border-2 border-black rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Recent Licenses</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold">License Key</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Max Users</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Purchased</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Expires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.licenses.recentLicenses.map((license) => (
                      <tr key={license.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm font-mono">{license.licenseKey}</td>
                        <td className="py-3 px-4 text-sm capitalize">{license.licenseType}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`capitalize ${
                            license.status === 'active' ? 'text-green-700' :
                            license.status === 'expired' ? 'text-orange-700' :
                            'text-red-700'
                          }`}>
                            {license.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">{license.maxUsers || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(license.purchasedAt)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {license.expiresAt ? formatDate(license.expiresAt) : 'Lifetime'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sign-ups Chart */}
          {chartData.length > 0 && (
            <div className="bg-white border-2 border-black rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Sign-ups Over Time (Last 30 Days)</h2>
              <div className="h-64 flex items-end gap-1">
                {chartData.map(([date, count]) => {
                  const maxCount = Math.max(...chartData.map(([, c]) => c), 1);
                  const height = (count / maxCount) * 100;
                  return (
                    <div key={date} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-black rounded-t transition-all hover:bg-gray-800"
                        style={{ height: `${height}%` }}
                        title={`${date}: ${count} sign-ups`}
                      />
                      <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                        {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Sign-ups */}
          <div className="bg-white border-2 border-black rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Sign-ups</h2>
            {stats.recentSignUps.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Membership</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Signed Up</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentSignUps.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm">{user.name}</td>
                        <td className="py-3 px-4 text-sm">{user.email}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className="capitalize">{user.membership}</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(user.createdAt)} at {formatTime(user.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No sign-ups yet</p>
            )}
          </div>

          {/* Refresh Button */}
          <div className="mt-8 text-center">
            <button
              onClick={fetchStats}
              className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-md transition-colors"
            >
              Refresh Statistics
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

