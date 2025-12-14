"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { login, hasActiveSession, getUser } from "@/libs/auth";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    pin: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetData, setResetData] = useState({
    email: '',
    secretAnswer: '',
    newPin: '',
    confirmPin: ''
  });
  const hasCheckedSession = useRef(false);
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Only check session once, and skip if user is actively logging in or already redirected
    if (hasCheckedSession.current || isLoading || hasRedirected.current) return;
    hasCheckedSession.current = true;
    
    const checkAndRedirect = async () => {
      if (typeof window === 'undefined') return;
      
      // Wait a bit for localStorage to be ready
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Double check after delay
      if (isLoading || hasRedirected.current) return;
      
      const sessionActive = hasActiveSession();
      const userData = getUser();
      
      if (sessionActive && userData && !hasRedirected.current) {
        hasRedirected.current = true;
        router.replace('/dashboard');
      }
    };
    
    checkAndRedirect();
  }, [router, isLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleResetChange = (e) => {
    const { name, value } = e.target;
    setResetData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.email || !formData.pin) {
      setError('Please enter your email and PIN');
      setIsLoading(false);
      return;
    }

    if (formData.pin.length !== 4 || !/^\d+$/.test(formData.pin)) {
      setError('PIN must be exactly 4 digits');
      setIsLoading(false);
      return;
    }

    const result = await login(formData.email, formData.pin);

    if (result.success) {
      setIsLoading(false);
      hasRedirected.current = true; // Mark as redirected to prevent useEffect from running
      // Small delay to ensure session is saved
      setTimeout(() => {
        router.replace('/dashboard');
      }, 150);
    } else {
      setError(result.error || 'Invalid email or PIN');
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!resetData.email || !resetData.secretAnswer || !resetData.newPin || !resetData.confirmPin) {
      setError('Please fill in all fields');
      return;
    }

    if (resetData.newPin.length !== 4 || !/^\d+$/.test(resetData.newPin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    if (resetData.newPin !== resetData.confirmPin) {
      setError('PINs do not match');
      return;
    }

    if (resetData.secretAnswer.length !== 4 || !/^\d+$/.test(resetData.secretAnswer)) {
      setError('Mom\'s birth year must be 4 digits');
      return;
    }

    const { resetPin } = await import('@/libs/auth');
    const result = resetPin(resetData.email, resetData.secretAnswer, resetData.newPin);

    if (result.success) {
      setError('');
      setShowReset(false);
      alert('PIN reset successfully! You can now login with your new PIN.');
    } else {
      setError(result.error || 'Failed to reset PIN');
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-base-100 py-12">
        <div className="max-w-md mx-auto px-6">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h1 className="text-3xl font-bold text-center mb-2">Login</h1>
              <p className="text-center text-base-content/70 mb-6">
                Enter your email and PIN to continue
              </p>

              {error && (
                <div className="alert alert-error mb-4">
                  <span>{error}</span>
                </div>
              )}

              {!showReset ? (
                <>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Email</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input input-bordered"
                        placeholder="your@email.com"
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">4-Digit PIN</span>
                      </label>
                      <input
                        type="password"
                        name="pin"
                        value={formData.pin}
                        onChange={handleChange}
                        className="input input-bordered"
                        placeholder="0000"
                        maxLength={4}
                        pattern="[0-9]{4}"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                  </form>

                  <div className="divider">OR</div>

                  <button
                    onClick={() => setShowReset(true)}
                    className="btn btn-ghost w-full"
                  >
                    Forgot PIN?
                  </button>

                  <p className="text-center text-sm">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="link link-primary">
                      Sign Up
                    </Link>
                  </p>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setShowReset(false);
                      setError('');
                      setResetData({ email: '', secretAnswer: '', newPin: '', confirmPin: '' });
                    }}
                    className="btn btn-sm btn-ghost mb-4"
                  >
                    ← Back to Login
                  </button>

                  <h2 className="text-xl font-bold mb-4">Reset PIN</h2>
                  <p className="text-sm text-base-content/70 mb-6">
                    Enter your email and answer the security question to reset your PIN.
                  </p>

                  <form onSubmit={handleResetSubmit} className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Email</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={resetData.email}
                        onChange={handleResetChange}
                        className="input input-bordered"
                        placeholder="your@email.com"
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Mom&apos;s Birth Year</span>
                      </label>
                      <input
                        type="text"
                        name="secretAnswer"
                        value={resetData.secretAnswer}
                        onChange={handleResetChange}
                        className="input input-bordered"
                        placeholder="YYYY"
                        maxLength={4}
                        pattern="[0-9]{4}"
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">New 4-Digit PIN</span>
                      </label>
                      <input
                        type="password"
                        name="newPin"
                        value={resetData.newPin}
                        onChange={handleResetChange}
                        className="input input-bordered"
                        placeholder="0000"
                        maxLength={4}
                        pattern="[0-9]{4}"
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Confirm New PIN</span>
                      </label>
                      <input
                        type="password"
                        name="confirmPin"
                        value={resetData.confirmPin}
                        onChange={handleResetChange}
                        className="input input-bordered"
                        placeholder="0000"
                        maxLength={4}
                        pattern="[0-9]{4}"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-full"
                    >
                      Reset PIN
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

