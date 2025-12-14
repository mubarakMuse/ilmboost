"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { hasActiveSession, getUser, logout, updatePin, updateProfile, getUserMembership } from "@/libs/auth";
import apiClient from "@/libs/api";
import config from "@/config";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("account");
  
  // PIN change form
  const [pinForm, setPinForm] = useState({
    currentPin: "",
    newPin: "",
    confirmPin: ""
  });
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState("");
  
  // Profile update form
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    dobMonth: "",
    dobYear: ""
  });
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  
  // Membership upgrade
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  useEffect(() => {
    let hasRedirected = false;
    
    const checkSession = () => {
      if (typeof window === 'undefined' || hasRedirected) {
        setIsLoading(false);
        return;
      }
      
      const sessionActive = hasActiveSession();
      const userData = getUser();
      
      if (!sessionActive || !userData) {
        hasRedirected = true;
        router.replace('/login');
        return;
      }

      setUser(userData);
      setProfileForm({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        dobMonth: userData.dobMonth || "",
        dobYear: userData.dobYear || ""
      });
      setIsLoading(false);
    };

    const timer = setTimeout(checkSession, 100);
    return () => clearTimeout(timer);
  }, [router]);

  const handlePinChange = (e) => {
    e.preventDefault();
    setPinError("");
    setPinSuccess("");

    if (pinForm.newPin.length !== 4 || !/^\d{4}$/.test(pinForm.newPin)) {
      setPinError("PIN must be exactly 4 digits");
      return;
    }

    if (pinForm.newPin !== pinForm.confirmPin) {
      setPinError("New PIN and confirm PIN do not match");
      return;
    }

    const result = updatePin(pinForm.currentPin, pinForm.newPin);
    
    if (result.success) {
      setPinSuccess("PIN updated successfully!");
      setPinForm({ currentPin: "", newPin: "", confirmPin: "" });
      // Update user state
      const updatedUser = getUser();
      setUser(updatedUser);
    } else {
      setPinError(result.error || "Failed to update PIN");
    }
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!profileForm.firstName || !profileForm.lastName) {
      setProfileError("First name and last name are required");
      return;
    }

    if (!profileForm.dobMonth || !profileForm.dobYear) {
      setProfileError("Date of birth is required");
      return;
    }

    const result = updateProfile(profileForm);
    
    if (result.success) {
      setProfileSuccess("Profile updated successfully!");
      setUser(result.user);
    } else {
      setProfileError(result.error || "Failed to update profile");
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleUpgradeMembership = async (planType = 'monthly') => {
    if (!user?.id) {
      return;
    }

    setIsUpgrading(true);
    try {
      const res = await apiClient.post("/stripe/create-checkout", {
        userId: user.id,
        email: user.email,
        priceId: planType === 'yearly' 
          ? config.stripe.plans.find(p => p.name === 'Yearly')?.priceId
          : config.stripe.plans.find(p => p.name === 'Monthly')?.priceId
      });
      
      if (res.url) {
        window.location.href = res.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e?.response?.data?.error || e?.message || "Failed to start checkout. Please try again.";
      alert(errorMessage);
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user?.id) {
      return;
    }

    setIsOpeningPortal(true);
    try {
      const res = await apiClient.post("/stripe/create-portal", {
        userId: user.id,
        returnUrl: window.location.href
      });
      
      if (res.url) {
        window.location.href = res.url;
      } else {
        throw new Error("Failed to open billing portal");
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e?.response?.data?.error || e?.message || "Failed to open billing portal. Please try again.";
      alert(errorMessage);
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const getCurrentPlanPrice = () => {
    if (membership === 'monthly') {
      const plan = config.stripe.plans.find(p => p.name === 'Monthly');
      return plan ? `$${plan.price}/month` : '$10/month';
    }
    if (membership === 'yearly') {
      const plan = config.stripe.plans.find(p => p.name === 'Yearly');
      return plan ? `$${plan.price}/year` : '$100/year';
    }
    return null;
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

  const membership = getUserMembership();
  const isPaid = membership === 'paid' || membership === 'monthly' || membership === 'yearly';
  
  const getMembershipDisplayName = () => {
    if (membership === 'monthly') return 'Monthly';
    if (membership === 'yearly') return 'Yearly';
    if (membership === 'paid') return 'Paid';
    return 'Free';
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-base-100 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">Account Settings</h1>
                <p className="text-base-content/70">
                  Manage your account and membership
                </p>
              </div>
              <Link href="/dashboard" className="btn btn-outline">
                ← Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs tabs-boxed mb-8">
            <button
              className={`tab ${activeTab === "account" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("account")}
            >
              Account Info
            </button>
            <button
              className={`tab ${activeTab === "membership" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("membership")}
            >
              Membership
            </button>
            <button
              className={`tab ${activeTab === "security" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("security")}
            >
              Security
            </button>
          </div>

          {/* Account Info Tab */}
          {activeTab === "account" && (
            <div className="space-y-6">
              <div className="card card-border bg-base-100 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-6">Account Information</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-base-200 rounded-lg p-4">
                      <label className="label pb-2">
                        <span className="label-text font-semibold text-lg">Email Address</span>
                      </label>
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="input input-bordered w-full bg-base-100"
                      />
                      <label className="label pt-1">
                        <span className="label-text-alt text-base-content/60">Email cannot be changed</span>
                      </label>
                    </div>

                    <div className="bg-base-200 rounded-lg p-4">
                      <label className="label pb-2">
                        <span className="label-text font-semibold text-lg">Membership Status</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <span className={`badge badge-lg ${isPaid ? 'badge-success' : 'badge-info'}`}>
                          {getMembershipDisplayName()}
                        </span>
                        {isPaid && getCurrentPlanPrice() && (
                          <span className="text-base-content/70 font-medium">
                            {getCurrentPlanPrice()}
                          </span>
                        )}
                        {!isPaid && (
                          <Link href="#membership" onClick={() => setActiveTab("membership")} className="link link-primary font-medium">
                            Upgrade now →
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="bg-base-200 rounded-lg p-4">
                      <label className="label pb-2">
                        <span className="label-text font-semibold text-lg">Member Since</span>
                      </label>
                      <p className="text-base-content/70 text-lg">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card card-border bg-base-100 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-6">Update Profile</h2>
                  
                  {profileError && (
                    <div className="alert alert-error mb-4">
                      <span>{profileError}</span>
                    </div>
                  )}
                  
                  {profileSuccess && (
                    <div className="alert alert-success mb-4">
                      <span>{profileSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleProfileUpdate}>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="label">
                          <span className="label-text">First Name</span>
                        </label>
                        <input
                          type="text"
                          value={profileForm.firstName}
                          onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                          className="input input-bordered w-full"
                          required
                        />
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text">Last Name</span>
                        </label>
                        <input
                          type="text"
                          value={profileForm.lastName}
                          onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                          className="input input-bordered w-full"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="label">
                          <span className="label-text">Birth Month</span>
                        </label>
                        <select
                          value={profileForm.dobMonth}
                          onChange={(e) => setProfileForm({ ...profileForm, dobMonth: e.target.value })}
                          className="select select-bordered w-full"
                          required
                        >
                          <option value="">Select Month</option>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                            <option key={month} value={month}>
                              {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text">Birth Year</span>
                        </label>
                        <input
                          type="number"
                          value={profileForm.dobYear}
                          onChange={(e) => setProfileForm({ ...profileForm, dobYear: e.target.value })}
                          className="input input-bordered w-full"
                          min="1900"
                          max={new Date().getFullYear()}
                          required
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary">
                      Update Profile
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Membership Tab */}
          {activeTab === "membership" && (
            <div className="space-y-6">
              {/* Current Membership Card */}
              <div className="card card-border bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="card-title text-2xl">Current Membership</h2>
                    <span className={`badge badge-lg ${isPaid ? 'badge-success' : 'badge-info'}`}>
                      {getMembershipDisplayName()}
                    </span>
                  </div>
                  
                  {isPaid ? (
                    <div className="space-y-4">
                      <div className="bg-base-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-lg">Pricing</span>
                          <span className="text-2xl font-bold text-primary">
                            {getCurrentPlanPrice()}
                          </span>
                        </div>
                        <p className="text-sm text-base-content/70">
                          {membership === 'monthly' 
                            ? 'Billed monthly. Cancel anytime.'
                            : 'Billed annually. Cancel anytime.'}
                        </p>
                      </div>
                      
                      <div className="divider"></div>
                      
                      <div>
                        <h3 className="font-semibold mb-2">Subscription Management</h3>
                        <p className="text-sm text-base-content/70 mb-4">
                          Manage your subscription, update payment methods, or cancel your membership.
                        </p>
                        <button
                          onClick={handleManageSubscription}
                          className="btn btn-outline btn-primary"
                          disabled={isOpeningPortal}
                        >
                          {isOpeningPortal ? (
                            <>
                              <span className="loading loading-spinner loading-xs"></span>
                              Opening...
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Manage Subscription
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-base-200 rounded-lg p-4">
                        <p className="text-base-content/70 mb-4">
                          Upgrade to paid membership for full access to all courses and features.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => handleUpgradeMembership('monthly')}
                            className="btn btn-primary flex-1"
                            disabled={isUpgrading}
                          >
                            {isUpgrading ? (
                              <>
                                <span className="loading loading-spinner loading-xs"></span>
                                Processing...
                              </>
                            ) : (
                              `Upgrade to Monthly - $${config.stripe.plans.find(p => p.name === 'Monthly')?.price || 10}/mo`
                            )}
                          </button>
                          <button
                            onClick={() => handleUpgradeMembership('yearly')}
                            className="btn btn-outline btn-primary flex-1"
                            disabled={isUpgrading}
                          >
                            {isUpgrading ? (
                              <>
                                <span className="loading loading-spinner loading-xs"></span>
                                Processing...
                              </>
                            ) : (
                              `Upgrade to Yearly - $${config.stripe.plans.find(p => p.name === 'Yearly')?.price || 100}/yr`
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Features Card */}
              <div className="card card-border bg-base-100">
                <div className="card-body">
                  <h3 className="card-title mb-4">Membership Benefits</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Access to all courses</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Full course content and materials</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Quizzes and assessments</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Progress tracking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Priority support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="card card-border bg-base-100 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-6">Change PIN</h2>
                
                {pinError && (
                  <div className="alert alert-error mb-4">
                    <span>{pinError}</span>
                  </div>
                )}
                
                {pinSuccess && (
                  <div className="alert alert-success mb-4">
                    <span>{pinSuccess}</span>
                  </div>
                )}

                <form onSubmit={handlePinChange}>
                  <div className="space-y-4">
                    <div>
                      <label className="label">
                        <span className="label-text">Current PIN</span>
                      </label>
                      <input
                        type="password"
                        value={pinForm.currentPin}
                        onChange={(e) => setPinForm({ ...pinForm, currentPin: e.target.value })}
                        className="input input-bordered w-full"
                        maxLength="4"
                        pattern="[0-9]{4}"
                        required
                      />
                    </div>

                    <div>
                      <label className="label">
                        <span className="label-text">New PIN</span>
                      </label>
                      <input
                        type="password"
                        value={pinForm.newPin}
                        onChange={(e) => setPinForm({ ...pinForm, newPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        className="input input-bordered w-full"
                        maxLength="4"
                        pattern="[0-9]{4}"
                        required
                      />
                      <label className="label">
                        <span className="label-text-alt text-base-content/60">Must be exactly 4 digits</span>
                      </label>
                    </div>

                    <div>
                      <label className="label">
                        <span className="label-text">Confirm New PIN</span>
                      </label>
                      <input
                        type="password"
                        value={pinForm.confirmPin}
                        onChange={(e) => setPinForm({ ...pinForm, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        className="input input-bordered w-full"
                        maxLength="4"
                        pattern="[0-9]{4}"
                        required
                      />
                    </div>

                    <button type="submit" className="btn btn-primary">
                      Change PIN
                    </button>
                  </div>
                </form>

                </div>
              </div>

              <div className="card card-border bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="font-semibold text-xl mb-2">Logout</h3>
                  <p className="text-sm text-base-content/70 mb-4">
                    Sign out of your account. You'll need to log in again to access your courses.
                  </p>
                  <button onClick={handleLogout} className="btn btn-outline btn-error">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

