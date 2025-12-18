"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { hasActiveSession, getUser } from "@/libs/auth";
import config from "@/config";
import apiClient from "@/libs/api";

function MembershipContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // License activation
  const [licenseKey, setLicenseKey] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [activationError, setActivationError] = useState("");
  const [activationSuccess, setActivationSuccess] = useState("");

  useEffect(() => {
    // Check if user is logged in (optional - page is public)
    const userData = getUser();
    if (userData && hasActiveSession()) {
      setUser(userData);
      // Check if user has an active license
      const checkLicense = async () => {
        try {
          const response = await fetch(`/api/licenses/check?userId=${userData.id}`);
          const data = await response.json();
          if (data.success && data.hasLicense) {
            // User has active license, redirect to dashboard
            router.push('/dashboard');
            return;
          }
        } catch (error) {
          console.error('Error checking license:', error);
        }
        setIsLoading(false);
      };
      checkLicense();
    } else {
      setIsLoading(false);
    }
  }, [router, searchParams]);

  const handleActivateLicense = async (e) => {
    e.preventDefault();
    setActivationError("");
    setActivationSuccess("");
    
    if (!licenseKey.trim()) {
      setActivationError("Please enter a license key");
      return;
    }
    
    if (!user || !hasActiveSession()) {
      setActivationError("Please log in to activate a license");
      router.push('/login');
      return;
    }
    
    setIsActivating(true);
    try {
      const response = await fetch('/api/licenses/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          licenseKey: licenseKey.trim()
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setActivationSuccess("License activated successfully! Redirecting to dashboard...");
        setLicenseKey("");
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        // Even if activation failed (e.g., already activated), refresh to show current status
        if (data.error && data.error.includes("already")) {
          setActivationSuccess("License is already active! Redirecting to dashboard...");
          setLicenseKey("");
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          setActivationError(data.error || "Failed to activate license");
        }
      }
    } catch (error) {
      console.error('Error activating license:', error);
      setActivationError("Failed to activate license. Please try again.");
    } finally {
      setIsActivating(false);
    }
  };

  const handlePurchaseLicense = async (licenseType) => {
    // Require login for license purchase
    if (!user || !hasActiveSession()) {
      router.push('/login');
      return;
    }

    // Organization licenses require admin contact
    if (licenseType === 'organization') {
      window.location.href = `mailto:${config.resend.supportEmail}?subject=Organization License Inquiry&body=Hello, I'm interested in purchasing an organization license for my group. Please contact me with pricing information.`;
      return;
    }

    setIsProcessing(true);
    try {
      const response = await apiClient.post("/licenses/purchase", {
        userId: user.id,
        licenseType
      });

      if (response.url) {
        window.location.href = response.url;
      } else {
        alert('Error creating checkout. Please try again.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Error creating checkout. Please try again.';
      alert(errorMessage);
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAFAFA] py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-black mb-4">Purchase a License</h1>
            <p className="text-lg text-gray-600">
              Choose a license to activate your account and access all courses
            </p>
            {!user || !hasActiveSession() ? (
              <div className="mt-6 bg-white border-2 border-gray-300 rounded-xl p-4 max-w-md mx-auto">
                <p className="text-sm text-gray-700">Please sign up or log in to purchase a license.</p>
              </div>
            ) : null}
          </div>

          {/* Activate Existing License */}
          {user && hasActiveSession() && (
            <div className="bg-white border-2 border-black rounded-xl p-6 sm:p-8 mb-12 shadow-sm">
              <h2 className="text-2xl font-serif font-bold text-black mb-2">Have a License Key?</h2>
              <p className="text-gray-600 mb-6">
                Activate your existing license key to get started immediately
              </p>
              
              <form onSubmit={handleActivateLicense} className="space-y-4">
                {activationError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{activationError}</p>
                  </div>
                )}
                {activationSuccess && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">{activationSuccess}</p>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                    placeholder="ILM-XXXX-XXXX-XXXX"
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors font-mono text-lg"
                    maxLength={20}
                    disabled={isActivating}
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isActivating || !licenseKey.trim()}
                  >
                    {isActivating ? 'Activating...' : 'Activate License'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Enter the license key provided by your organization or family plan owner
                </p>
              </form>
            </div>
          )}

          <div className="flex items-center gap-4 my-12">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="text-gray-600 font-medium">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-black mb-2">Purchase a New License</h2>
            <p className="text-gray-600">Select a license plan below</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Single User License */}
            <div className="bg-white border-2 border-gray-300 rounded-xl p-6 sm:p-8 hover:border-black transition-colors">
              <h2 className="text-2xl font-serif font-bold text-black mb-4">Single User</h2>
              <div className="text-4xl font-bold text-black mb-2">
                $50
                <span className="text-lg font-normal text-gray-600">/year</span>
              </div>
              <p className="text-sm text-gray-600 mb-6">Recurring annual subscription</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-black mt-1">✓</span>
                  <span>Access to all courses</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-black mt-1">✓</span>
                  <span>Full course content</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-black mt-1">✓</span>
                  <span>Advanced materials</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-black mt-1">✓</span>
                  <span>Priority support</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-black mt-1">✓</span>
                  <span>Annual license (1 year)</span>
                </li>
              </ul>
              <button
                onClick={() => handlePurchaseLicense('single')}
                className="w-full px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessing || !user || !hasActiveSession()}
              >
                {isProcessing ? 'Processing...' : 'Purchase License'}
              </button>
            </div>

            {/* Family/Group License */}
            <div className="bg-gradient-to-br from-[#F5E6D3] to-[#E8D4B8] border-2 border-black rounded-xl p-6 sm:p-8 shadow-lg relative">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-black text-white text-xs font-semibold rounded-md">BEST VALUE</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-black mb-4">Family/Group</h2>
              <div className="text-4xl font-bold text-black mb-2">
                $120
                <span className="text-lg font-normal text-gray-700">/year</span>
              </div>
              <div className="mb-2">
                <span className="text-lg line-through text-gray-600">$500</span>
                <span className="text-sm text-gray-700 ml-2">Save $380</span>
              </div>
              <p className="text-sm text-gray-700 mb-6">Recurring annual subscription</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-gray-800">
                  <span className="text-black mt-1">✓</span>
                  <span>Access for up to 10 users</span>
                </li>
                <li className="flex items-start gap-2 text-gray-800">
                  <span className="text-black mt-1">✓</span>
                  <span>All courses included</span>
                </li>
                <li className="flex items-start gap-2 text-gray-800">
                  <span className="text-black mt-1">✓</span>
                  <span>Full course content</span>
                </li>
                <li className="flex items-start gap-2 text-gray-800">
                  <span className="text-black mt-1">✓</span>
                  <span>Advanced materials</span>
                </li>
                <li className="flex items-start gap-2 text-gray-800">
                  <span className="text-black mt-1">✓</span>
                  <span>Priority support</span>
                </li>
                <li className="flex items-start gap-2 text-gray-800">
                  <span className="text-black mt-1">✓</span>
                  <span>Annual license (1 year)</span>
                </li>
              </ul>
              <button
                onClick={() => handlePurchaseLicense('family')}
                className="w-full px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessing || !user || !hasActiveSession()}
              >
                {isProcessing ? 'Processing...' : 'Purchase License'}
              </button>
            </div>

            {/* Organization License */}
            <div className="bg-white border-2 border-gray-300 rounded-xl p-6 sm:p-8 hover:border-black transition-colors">
              <h2 className="text-2xl font-serif font-bold text-black mb-4">Organization</h2>
              <div className="text-4xl font-bold text-black mb-2">
                Custom
              </div>
              <p className="text-sm text-gray-600 mb-6">Contact us for pricing</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-black mt-1">✓</span>
                  <span>Custom user limit</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-black mt-1">✓</span>
                  <span>All courses included</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-black mt-1">✓</span>
                  <span>Bulk licensing discounts</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-black mt-1">✓</span>
                  <span>Dedicated support</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-black mt-1">✓</span>
                  <span>Custom terms available</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-black mt-1">✓</span>
                  <span>Contact admin for pricing</span>
                </li>
              </ul>
              <button
                onClick={() => handlePurchaseLicense('organization')}
                className="w-full px-6 py-3 bg-white text-black font-semibold border-2 border-black rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessing || !user || !hasActiveSession()}
              >
                Contact Admin
              </button>
            </div>
          </div>

          {!user || !hasActiveSession() ? (
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">Need to create an account first?</p>
              <div className="flex gap-4 justify-center">
                <Link href="/signup" className="px-6 py-2 bg-[#F5E6D3] hover:bg-[#E8D4B8] text-black font-semibold rounded-lg transition-colors">
                  Sign Up
                </Link>
                <Link href="/login" className="px-6 py-2 bg-white hover:bg-gray-50 text-black font-semibold border-2 border-black rounded-lg transition-colors">
                  Login
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center mt-12">
              <Link href="/dashboard" className="text-gray-600 hover:text-black transition-colors">
                Go to Dashboard →
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function MembershipPage() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </main>
        <Footer />
      </>
    }>
      <MembershipContent />
    </Suspense>
  );
}
