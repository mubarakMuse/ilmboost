"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getUser, logout } from "@/libs/auth";

export default function StripeSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("processing");
  const userId = searchParams.get("userId");
  const membership = searchParams.get("membership") || "paid";
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!userId) {
      router.push("/membership");
      return;
    }

    // Verify payment and refresh user data
    const verifyPayment = async () => {
      try {
        console.log("Verifying payment:", { userId, sessionId, membership });
        
        // Verify session with Stripe
        const response = await fetch("/api/stripe/verify-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            sessionId,
          }),
        });

        if (!response.ok) {
          console.error("Verify session failed:", response.status, await response.text());
          setStatus("error");
          return;
        }

        const data = await response.json();
        console.log("Verify session response:", data);

        if (data.success) {
          // Fetch updated user data from API
          const userResponse = await fetch(`/api/auth/user?userId=${userId}`);
          
          if (!userResponse.ok) {
            console.error("Get user failed:", userResponse.status);
            // Fall through to update localStorage directly
          } else {
            const userData = await userResponse.json();
            console.log("User data response:", userData);
            
            if (userData.success && userData.user) {
              // Update localStorage session with new membership
              const currentSession = JSON.parse(localStorage.getItem('ilmboost_session') || '{}');
              if (currentSession.user) {
                currentSession.user.membership = userData.user.membership || membership;
                localStorage.setItem('ilmboost_session', JSON.stringify(currentSession));
              }
              
              setStatus("success");
              setTimeout(() => {
                router.push("/dashboard");
              }, 2000);
              return;
            }
          }
          
          // Fallback: If API doesn't have updated data yet, update localStorage directly
          const currentUser = getUser();
          if (currentUser && currentUser.id === userId) {
            const session = JSON.parse(localStorage.getItem('ilmboost_session') || '{}');
            session.user.membership = membership;
            localStorage.setItem('ilmboost_session', JSON.stringify(session));
            setStatus("success");
            setTimeout(() => {
              router.push("/dashboard");
            }, 2000);
          } else {
            console.error("Current user doesn't match userId or not found");
            setStatus("error");
          }
        } else {
          console.error("Verify session returned error:", data.error);
          setStatus("error");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setStatus("error");
      }
    };

    verifyPayment();
  }, [userId, sessionId, membership, router]);

  if (status === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4 text-base-content/70">Processing your payment...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="card bg-base-100 shadow-lg max-w-md">
          <div className="card-body text-center">
            <h2 className="card-title text-error justify-center">Payment Error</h2>
            <p className="text-base-content/70 mb-2">
              There was an error processing your payment.
            </p>
            <p className="text-sm text-base-content/60 mb-4">
              Your payment may have been successful. Please check your account settings or contact support if the issue persists.
            </p>
            <div className="card-actions justify-center gap-2">
              <button
                onClick={() => router.push("/dashboard")}
                className="btn btn-outline"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => router.push("/membership")}
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="card bg-base-100 shadow-lg max-w-md">
        <div className="card-body text-center">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="card-title text-success justify-center">Payment Successful!</h2>
          <p className="text-base-content/70">
            Your premium membership has been activated. Redirecting to dashboard...
          </p>
        </div>
      </div>
    </div>
  );
}

