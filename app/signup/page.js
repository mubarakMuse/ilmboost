"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { signup } from "@/libs/auth";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    pin: '',
    confirmPin: '',
    secretAnswer: '' // Mom's birth year
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!formData.email || !formData.firstName || !formData.lastName) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (formData.pin.length !== 4 || !/^\d+$/.test(formData.pin)) {
      setError('PIN must be exactly 4 digits');
      setIsLoading(false);
      return;
    }

    if (formData.pin !== formData.confirmPin) {
      setError('PINs do not match');
      setIsLoading(false);
      return;
    }

    if (!formData.secretAnswer || formData.secretAnswer.length !== 4 || !/^\d+$/.test(formData.secretAnswer)) {
      setError('Mom\'s birth year must be 4 digits');
      setIsLoading(false);
      return;
    }

    try {
      // Signup - await the async function (always free, license purchased separately)
      const result = await signup({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: '', // Phone not required during signup
        dobMonth: '', // Date of birth not required during signup
        dobYear: '', // Date of birth not required during signup
        pin: formData.pin,
        secretAnswer: formData.secretAnswer,
        membership: 'free' // Always free on signup, license purchased separately
      });

      if (result.success) {
        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 100);
      } else {
        setError(result.error || 'Signup failed. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('Signup failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold text-black mb-3">Create Account</h1>
            <p className="text-gray-600 text-base">Start your learning journey today</p>
          </div>

          <div className="bg-white border-2 border-black rounded-xl p-8 shadow-sm">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Email <span className="text-red-500">*</span>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                    placeholder="First Name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                    placeholder="Last Name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  4-Digit PIN <span className="text-red-500">*</span>
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
                <p className="mt-1 text-xs text-gray-500">Enter a 4-digit PIN for login</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Confirm PIN <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPin"
                  value={formData.confirmPin}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                  placeholder="0000"
                  maxLength={4}
                  pattern="[0-9]{4}"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Mom&apos;s Birth Year - Used for password recovery  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="secretAnswer"
                  value={formData.secretAnswer}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                  placeholder="YYYY"
                  maxLength={4}
                  pattern="[0-9]{4}"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">In case you forget your PIN</p>
              </div>

              <button
                type="submit"
                className={`w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-black font-semibold hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function SignupPage() {
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
      <SignupContent />
    </Suspense>
  );
}
