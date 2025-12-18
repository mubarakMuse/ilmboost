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
      <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold text-black mb-3">Welcome Back</h1>
            <p className="text-gray-600 text-base">Enter your credentials to continue</p>
          </div>

          <div className="bg-white border-2 border-black rounded-xl p-8 shadow-sm">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {!showReset ? (
              <>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      4-Digit PIN
                    </label>
                    <input
                      type="password"
                      name="pin"
                      value={formData.pin}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                      placeholder="0000"
                      maxLength={4}
                      pattern="[0-9]{4}"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                  <button
                    onClick={() => setShowReset(true)}
                    className="w-full text-sm text-gray-600 hover:text-black transition-colors"
                  >
                    Forgot PIN?
                  </button>

                  <p className="text-center text-sm text-gray-600">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="text-black font-semibold hover:underline">
                      Sign Up
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setShowReset(false);
                    setError('');
                    setResetData({ email: '', secretAnswer: '', newPin: '', confirmPin: '' });
                  }}
                  className="mb-4 text-sm text-gray-600 hover:text-black transition-colors flex items-center gap-2"
                >
                  <span>←</span> Back to Login
                </button>

                <h2 className="text-2xl font-serif font-bold mb-2">Reset PIN</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Enter your email and answer the security question to reset your PIN.
                </p>

                <form onSubmit={handleResetSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={resetData.email}
                      onChange={handleResetChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Mom&apos;s Birth Year
                    </label>
                    <input
                      type="text"
                      name="secretAnswer"
                      value={resetData.secretAnswer}
                      onChange={handleResetChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                      placeholder="YYYY"
                      maxLength={4}
                      pattern="[0-9]{4}"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      New 4-Digit PIN
                    </label>
                    <input
                      type="password"
                      name="newPin"
                      value={resetData.newPin}
                      onChange={handleResetChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                      placeholder="0000"
                      maxLength={4}
                      pattern="[0-9]{4}"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Confirm New PIN
                    </label>
                    <input
                      type="password"
                      name="confirmPin"
                      value={resetData.confirmPin}
                      onChange={handleResetChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                      placeholder="0000"
                      maxLength={4}
                      pattern="[0-9]{4}"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Reset PIN
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
