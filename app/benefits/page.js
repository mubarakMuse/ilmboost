"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { hasActiveSession, getUser, hasActiveLicense } from "@/libs/auth";

export default function BenefitsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [hasLicense, setHasLicense] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      const sessionActive = hasActiveSession();
      const userData = getUser();
      
      if (!sessionActive || !userData) {
        router.push('/login');
        return;
      }
      
      setUser(userData);
      
      // Check if user has a license
      const licenseCheck = await hasActiveLicense();
      setHasLicense(licenseCheck);
      
      setIsLoading(false);
    };
    
    checkAccess();
  }, [router]);

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

  if (!hasLicense) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-base-100">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body text-center">
                <h1 className="text-2xl font-bold mb-4">License Required</h1>
                <p className="text-base-content/70 mb-6">
                  Member benefits are only available to licensed users. Please purchase a license to access exclusive discounts and offers.
                </p>
                <Link href="/membership" className="btn btn-primary">
                  Purchase License
                </Link>
              </div>
            </div>
          </div>
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
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body text-center py-16">
              <div className="text-6xl mb-6">🎁</div>
              <h1 className="text-4xl font-bold mb-4">Member Benefits</h1>
              <p className="text-2xl text-base-content/70 mb-8">
                Coming Soon
              </p>
              <p className="text-base-content/60 mb-8 max-w-md mx-auto">
                We&apos;re working on bringing you exclusive discounts, special offers, and member-only benefits. Check back soon!
              </p>
              <div className="text-center mt-8">
                <Link href="/dashboard" className="link link-hover">
                  ← Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

