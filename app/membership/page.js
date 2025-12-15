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
        <main className="min-h-screen bg-base-100 flex items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-base-100 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Purchase a License</h1>
            <p className="text-xl text-base-content/70">
              Choose a license to activate your account and access all courses
            </p>
            {!user || !hasActiveSession() ? (
              <div className="alert alert-info mt-4 max-w-md mx-auto">
                <div>
                  <p className="text-sm">Please sign up or log in to purchase a license.</p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Activate Existing License */}
          {user && hasActiveSession() && (
            <div className="card bg-base-100 border-2 border-primary shadow-lg mb-8">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1">
                    <h2 className="card-title text-2xl">Have a License Key?</h2>
                    <p className="text-base-content/70 mt-1">
                      Activate your existing license key to get started immediately
                    </p>
                  </div>
                </div>
                
                <form onSubmit={handleActivateLicense} className="space-y-4">
                  {activationError && (
                    <div className="alert alert-error">
                      <span className="text-sm">{activationError}</span>
                    </div>
                  )}
                  {activationSuccess && (
                    <div className="alert alert-success">
                      <span className="text-sm">{activationSuccess}</span>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={licenseKey}
                      onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                      placeholder="ILM-XXXX-XXXX-XXXX"
                      className="input input-bordered flex-1 font-mono text-lg"
                      maxLength={20}
                      disabled={isActivating}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isActivating || !licenseKey.trim()}
                    >
                      {isActivating ? (
                        <>
                          <span className="loading loading-spinner loading-xs"></span>
                          Activating...
                        </>
                      ) : (
                        'Activate License'
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-base-content/60 text-center">
                    Enter the license key provided by your organization or family plan owner
                  </p>
                </form>
              </div>
            </div>
          )}

          <div className="divider my-8">
            <span className="text-base-content/60">OR</span>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Purchase a New License</h2>
            <p className="text-base-content/70">Select a license plan below</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Single User License */}
            <div className="card bg-base-100 border-2 border-base-300">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-2">Single User</h2>
                <div className="text-4xl font-bold mb-4">
                  $50
                  <span className="text-lg font-normal text-base-content/70">/year</span>
                </div>
                <p className="text-sm text-base-content/60 mb-4">Recurring annual subscription</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>Access to all courses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>Full course content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>Advanced materials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>Annual license (1 year)</span>
                  </li>
                </ul>
                <button
                  onClick={() => handlePurchaseLicense('single')}
                  className="btn btn-primary w-full"
                  disabled={isProcessing || !user || !hasActiveSession()}
                >
                  {isProcessing ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Processing...
                    </>
                  ) : (
                    'Purchase License'
                  )}
                </button>
              </div>
            </div>

            {/* Family/Group License */}
            <div className="card bg-primary text-primary-content border-2 border-primary">
              <div className="card-body">
                <div className="badge badge-secondary mb-2">BEST VALUE</div>
                <h2 className="card-title text-2xl mb-2">Family/Group</h2>
                <div className="text-4xl font-bold mb-2">
                  $120
                  <span className="text-lg font-normal opacity-80">/year</span>
                </div>
                <div className="mb-2">
                  <span className="text-lg line-through opacity-70">$500</span>
                  <span className="text-sm opacity-80 ml-2">Save $380</span>
                </div>
                <p className="text-sm opacity-70 mb-4">Recurring annual subscription</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Access for up to 10 users</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>All courses included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Full course content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Advanced materials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Annual license (1 year)</span>
                  </li>
                </ul>
                <button
                  onClick={() => handlePurchaseLicense('family')}
                  className="btn btn-secondary w-full"
                  disabled={isProcessing || !user || !hasActiveSession()}
                >
                  {isProcessing ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Processing...
                    </>
                  ) : (
                    'Purchase License'
                  )}
                </button>
              </div>
            </div>

            {/* Organization License */}
            <div className="card bg-base-100 border-2 border-base-300">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-2">Organization</h2>
                <div className="text-4xl font-bold mb-4">
                  Custom
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>Custom user limit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>All courses included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>Bulk licensing discounts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>Dedicated support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>Custom terms available</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>Contact admin for pricing</span>
                  </li>
                </ul>
                <button
                  onClick={() => handlePurchaseLicense('organization')}
                  className="btn btn-outline w-full"
                  disabled={isProcessing || !user || !hasActiveSession()}
                >
                  Contact Admin
                </button>
              </div>
            </div>
          </div>

          {!user || !hasActiveSession() ? (
            <div className="text-center mt-8">
              <p className="text-base-content/70 mb-2">Need to create an account first?</p>
              <div className="flex gap-4 justify-center">
                <Link href="/signup" className="link link-primary">
                  Sign Up
                </Link>
                <span className="text-base-content/50">|</span>
                <Link href="/login" className="link link-primary">
                  Login
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center mt-8">
              <Link href="/dashboard" className="link link-hover">
                Go to Dashboard
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
        <main className="min-h-screen bg-base-100 flex items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </main>
        <Footer />
      </>
    }>
      <MembershipContent />
    </Suspense>
  );
}

