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

  useEffect(() => {
    // Check if there's a plan in URL (from signup)
    const plan = searchParams.get('plan');
    if (plan) {
      setSelectedPlan(plan);
    }

    // Check if user is logged in (optional - page is public)
    const userData = getUser();
    if (userData && hasActiveSession()) {
      setUser(userData);
      // If user already has paid membership, redirect to dashboard
      if (userData?.membership === 'paid' || userData?.membership === 'monthly' || userData?.membership === 'yearly') {
        router.push('/dashboard');
        return;
      }
    }
    
    setIsLoading(false);
  }, [router, searchParams]);

  const handleSelectMembership = async (tier, priceId) => {
    if (tier === 'free') {
      // Free membership - redirect to login if not logged in, or dashboard if logged in
      if (!user || !hasActiveSession()) {
        router.push('/login');
      } else {
        router.push('/dashboard');
      }
    } else if (tier === 'monthly' || tier === 'yearly') {
      // Paid membership - redirect to Stripe checkout
      if (!user || !hasActiveSession()) {
        // If not logged in, redirect to signup with selected plan
        router.push(`/signup?membership=${tier}`);
        return;
      }

      setIsProcessing(true);
      try {
        const plan = config.stripe.plans.find(p => p.name === (tier === 'monthly' ? 'Monthly' : 'Yearly'));
        const response = await apiClient.post("/stripe/create-checkout", {
          userId: user.id,
          email: user.email,
          priceId: priceId || plan?.priceId
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
            <h1 className="text-4xl font-bold mb-4">Choose Your Membership</h1>
            <p className="text-xl text-base-content/70">
              Select the plan that works best for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Membership */}
            <div className="card bg-base-100 border-2 border-base-300">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-2">Free</h2>
                <div className="text-4xl font-bold mb-4">
                  $0
                  <span className="text-lg font-normal text-base-content/70">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>Access to basic courses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>Limited course content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>Community access</span>
                  </li>
                </ul>
                <button
                  onClick={() => handleSelectMembership('free')}
                  className="btn btn-outline w-full"
                  disabled={isProcessing}
                >
                  {user && hasActiveSession() ? 'Continue with Free' : 'Sign Up Free'}
                </button>
              </div>
            </div>

            {/* Monthly Membership */}
            <div className="card bg-base-100 border-2 border-base-300">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-2">Monthly</h2>
                <div className="text-4xl font-bold mb-4">
                  $10
                  <span className="text-lg font-normal text-base-content/70">/month</span>
                </div>
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
                    <span>Exclusive content</span>
                  </li>
                </ul>
                <button
                  onClick={() => handleSelectMembership('monthly', config.stripe.plans.find(p => p.name === 'Monthly')?.priceId)}
                  className="btn btn-primary w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Processing...
                    </>
                  ) : (
                    user && hasActiveSession() ? 'Subscribe Now' : 'Sign Up & Subscribe'
                  )}
                </button>
              </div>
            </div>

            {/* Yearly Membership */}
            <div className="card bg-primary text-primary-content border-2 border-primary">
              <div className="card-body">
                <div className="badge badge-secondary mb-2">BEST VALUE</div>
                <h2 className="card-title text-2xl mb-2">Yearly</h2>
                <div className="text-4xl font-bold mb-2">
                  $100
                  <span className="text-lg font-normal opacity-80">/year</span>
                </div>
                <div className="mb-4">
                  <span className="text-lg line-through opacity-70">$120</span>
                  <span className="text-sm opacity-80 ml-2">Save $20</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Access to all courses</span>
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
                    <span>Exclusive content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Save $20 per year</span>
                  </li>
                </ul>
                <button
                  onClick={() => handleSelectMembership('yearly', config.stripe.plans.find(p => p.name === 'Yearly')?.priceId)}
                  className="btn btn-secondary w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Processing...
                    </>
                  ) : (
                    user && hasActiveSession() ? 'Subscribe Now' : 'Sign Up & Subscribe'
                  )}
                </button>
              </div>
            </div>
          </div>

          {!user || !hasActiveSession() ? (
            <div className="text-center mt-8">
              <p className="text-base-content/70 mb-2">Already have an account?</p>
              <Link href="/login" className="link link-primary">
                Login here
              </Link>
            </div>
          ) : (
            <div className="text-center mt-8">
              <Link href="/dashboard" className="link link-hover">
                Skip for now
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

