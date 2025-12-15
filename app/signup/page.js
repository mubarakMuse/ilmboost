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
    phone: '',
    dobMonth: '',
    dobYear: '',
    pin: '',
    confirmPin: '',
    secretAnswer: '', // Mom's birth year
    membership: 'free' // Selected membership tier
  });

  useEffect(() => {
    // Check if there's a membership plan in URL
    const membership = searchParams.get('membership');
    if (membership && (membership === 'free' || membership === 'monthly' || membership === 'yearly')) {
      setFormData(prev => ({ ...prev, membership }));
    }
  }, [searchParams]);
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
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.phone) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (!formData.dobMonth || !formData.dobYear) {
      setError('Please select your date of birth');
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
      // Signup - await the async function
      const result = await signup({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dobMonth: formData.dobMonth,
        dobYear: formData.dobYear,
        pin: formData.pin,
        secretAnswer: formData.secretAnswer,
        membership: formData.membership
      });

      if (result.success) {
        // If user selected paid membership, redirect to checkout
        if (formData.membership === 'monthly' || formData.membership === 'yearly') {
          // Redirect to checkout with selected plan
          setTimeout(() => {
            router.push(`/membership?plan=${formData.membership}`);
          }, 100);
        } else {
          // Free membership - go to dashboard
          setTimeout(() => {
            router.push('/dashboard');
            router.refresh(); // Refresh to ensure state is updated
          }, 100);
        }
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

  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return { value: month.toString().padStart(2, '0'), label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' }) };
  });

  // Generate year options (1900 to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-base-100 py-12">
        <div className="max-w-md mx-auto px-6">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
              <p className="text-center text-base-content/70 mb-6">
                Sign up to start your learning journey
              </p>

              {error && (
                <div className="alert alert-error mb-4">
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email *</span>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">First Name *</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="input input-bordered"
                      placeholder="First Name"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Last Name *</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="input input-bordered"
                      placeholder="Last Name"
                      required
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Phone Number *</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input input-bordered"
                    placeholder="+1234567890"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Birth Month *</span>
                    </label>
                    <select
                      name="dobMonth"
                      value={formData.dobMonth}
                      onChange={handleChange}
                      className="select select-bordered"
                      required
                    >
                      <option value="">Select Month</option>
                      {months.map(month => (
                        <option key={month.value} value={month.value}>{month.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Birth Year *</span>
                    </label>
                    <select
                      name="dobYear"
                      value={formData.dobYear}
                      onChange={handleChange}
                      className="select select-bordered"
                      required
                    >
                      <option value="">Select Year</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">4-Digit PIN *</span>
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
                  <label className="label">
                    <span className="label-text-alt">Enter a 4-digit PIN for login</span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Confirm PIN *</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPin"
                    value={formData.confirmPin}
                    onChange={handleChange}
                    className="input input-bordered"
                    placeholder="0000"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Mom&apos;s Birth Year *</span>
                  </label>
                  <input
                    type="text"
                    name="secretAnswer"
                    value={formData.secretAnswer}
                    onChange={handleChange}
                    className="input input-bordered"
                    placeholder="YYYY"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    required
                  />
                  <label className="label">
                    <span className="label-text-alt">Used for password recovery (4 digits)</span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Choose Membership Plan *</span>
                  </label>
                  <div className="space-y-2">
                    <label className="label cursor-pointer justify-start gap-3 border rounded-lg p-4 hover:bg-base-200">
                      <input
                        type="radio"
                        name="membership"
                        value="free"
                        checked={formData.membership === 'free'}
                        onChange={handleChange}
                        className="radio radio-primary"
                      />
                      <div className="flex-1">
                        <span className="label-text font-semibold">Free</span>
                        <p className="text-xs text-base-content/70">Basic access to courses</p>
                      </div>
                      <span className="text-lg font-bold">$0</span>
                    </label>
                    
                    <label className="label cursor-pointer justify-start gap-3 border rounded-lg p-4 hover:bg-base-200">
                      <input
                        type="radio"
                        name="membership"
                        value="monthly"
                        checked={formData.membership === 'monthly'}
                        onChange={handleChange}
                        className="radio radio-primary"
                      />
                      <div className="flex-1">
                        <span className="label-text font-semibold">Monthly</span>
                        <p className="text-xs text-base-content/70">Full access - $10/month</p>
                      </div>
                      <span className="text-lg font-bold">$10<span className="text-sm font-normal">/mo</span></span>
                    </label>
                    
                    <label className="label cursor-pointer justify-start gap-3 border rounded-lg p-4 hover:bg-base-200 border-primary">
                      <input
                        type="radio"
                        name="membership"
                        value="yearly"
                        checked={formData.membership === 'yearly'}
                        onChange={handleChange}
                        className="radio radio-primary"
                      />
                      <div className="flex-1">
                        <span className="label-text font-semibold">Yearly <span className="badge badge-sm badge-primary">Best Value</span></span>
                        <p className="text-xs text-base-content/70">Full access - Save $20/year</p>
                      </div>
                      <div>
                        <span className="text-lg font-bold">$100</span>
                        <span className="text-xs line-through text-base-content/50 ml-1">$120</span>
                        <span className="text-xs text-base-content/70 block">/year</span>
                      </div>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>

              <div className="divider">OR</div>

              <p className="text-center text-sm">
                Already have an account?{' '}
                <Link href="/login" className="link link-primary">
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
        <main className="min-h-screen bg-base-100 flex items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </main>
        <Footer />
      </>
    }>
      <SignupContent />
    </Suspense>
  );
}

