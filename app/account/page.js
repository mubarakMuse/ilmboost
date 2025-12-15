"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { hasActiveSession, getUser, logout, updatePin, updateProfile, getUserMembership, hasActiveLicense } from "@/libs/auth";
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
  
  // License status
  const [license, setLicense] = useState(null);
  const [hasLicense, setHasLicense] = useState(false);
  const [isCheckingLicense, setIsCheckingLicense] = useState(true);
  const [isLicenseOwner, setIsLicenseOwner] = useState(false);
  const [licenseUsers, setLicenseUsers] = useState([]);
  
  // License activation
  const [licenseKey, setLicenseKey] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [activationError, setActivationError] = useState("");
  const [activationSuccess, setActivationSuccess] = useState("");

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
      
      // Check license status
      if (userData?.id) {
        checkLicenseStatus(userData.id);
      } else {
        setIsCheckingLicense(false);
      }
      
      setIsLoading(false);
    };
    
    const checkLicenseStatus = async (userId) => {
      try {
        const response = await fetch(`/api/licenses/check?userId=${userId}`);
        const data = await response.json();
        if (data.success) {
          setHasLicense(data.hasLicense);
          setLicense(data.license);
          
          // Check if user is the license owner
          if (data.license && data.license.user_id === userId) {
            setIsLicenseOwner(true);
            // Load license users if owner
            loadLicenseUsers(data.license.id, userId);
          } else {
            setIsLicenseOwner(false);
          }
        }
      } catch (error) {
        console.error('Error checking license:', error);
      } finally {
        setIsCheckingLicense(false);
      }
    };
    
    const loadLicenseUsers = async (licenseId, userId) => {
      try {
        const response = await fetch(`/api/licenses/users?licenseId=${licenseId}&userId=${userId}`);
        const data = await response.json();
        if (data.success) {
          setLicenseUsers(data.users || []);
        }
      } catch (error) {
        console.error('Error loading license users:', error);
      }
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

  const getLicenseDisplayName = () => {
    if (!license) return 'No License';
    const type = license.license_type || license.licenseType;
    if (type === 'single') return 'Single User License';
    if (type === 'family') return 'Family/Group License';
    if (type === 'organization') return 'Organization License';
    return 'Active License';
  };
  
  const getLicenseExpiry = () => {
    if (!license) return null;
    const expiresAt = license.expires_at || license.expiresAt;
    if (!expiresAt) return 'Active (Annual Subscription)';
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    if (expiryDate < now) {
      return `Expired: ${expiryDate.toLocaleDateString()}`;
    }
    return expiryDate.toLocaleDateString();
  };
  
  const refreshLicenseStatus = async () => {
    if (!user?.id) return;
    
    setIsCheckingLicense(true);
    try {
      const checkResponse = await fetch(`/api/licenses/check?userId=${user.id}`);
      const checkData = await checkResponse.json();
      
      if (checkData.success) {
        setHasLicense(checkData.hasLicense);
        setLicense(checkData.license);
        
        // Check if user is the license owner
        if (checkData.license && checkData.license.user_id === user.id) {
          setIsLicenseOwner(true);
          // Load license users if owner
          if (checkData.license.id) {
            const usersResponse = await fetch(`/api/licenses/users?licenseId=${checkData.license.id}&userId=${user.id}`);
            const usersData = await usersResponse.json();
            if (usersData.success) {
              setLicenseUsers(usersData.users || []);
            }
          }
        } else {
          setIsLicenseOwner(false);
          setLicenseUsers([]);
        }
      }
    } catch (error) {
      console.error('Error refreshing license status:', error);
    } finally {
      setIsCheckingLicense(false);
    }
  };

  const handleActivateLicense = async (e) => {
    e.preventDefault();
    setActivationError("");
    setActivationSuccess("");
    
    if (!licenseKey.trim()) {
      setActivationError("Please enter a license key");
      return;
    }
    
    if (!user?.id) {
      setActivationError("User not found");
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
        setActivationSuccess("License activated successfully!");
        setLicenseKey("");
        
        // Reload license status
        await refreshLicenseStatus();
      } else {
        // Even if activation failed (e.g., already activated), refresh to show current status
        if (data.error && data.error.includes("already")) {
          setActivationSuccess("License is already active on your account!");
          setLicenseKey("");
          await refreshLicenseStatus();
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
  
  const handleLeaveLicense = async () => {
    if (!user?.id || !license?.id) return;
    
    if (!confirm("Are you sure you want to leave this license? You will lose access to premium courses.")) {
      return;
    }
    
    try {
      const response = await fetch('/api/licenses/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          licenseId: license.id
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Reload license status
        const checkResponse = await fetch(`/api/licenses/check?userId=${user.id}`);
        const checkData = await checkResponse.json();
        if (checkData.success) {
          setHasLicense(checkData.hasLicense);
          setLicense(checkData.license);
          setIsLicenseOwner(false);
        }
        alert("Successfully left license");
      } else {
        alert(data.error || "Failed to leave license");
      }
    } catch (error) {
      console.error('Error leaving license:', error);
      alert("Failed to leave license. Please try again.");
    }
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
                  Manage your account and license
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
              License
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
                        <span className="label-text font-semibold text-lg">License Status</span>
                      </label>
                      <div className="flex items-center gap-3 flex-wrap">
                        {isCheckingLicense ? (
                          <span className="loading loading-spinner loading-sm"></span>
                        ) : hasLicense ? (
                          <>
                            <span className="badge badge-lg badge-success">
                              {getLicenseDisplayName()}
                            </span>
                            {getLicenseExpiry() && (
                              <span className="text-base-content/70 font-medium">
                                Expires: {getLicenseExpiry()}
                              </span>
                            )}
                            {license?.license_key && (
                              <span className="text-xs text-base-content/60 font-mono">
                                {license.license_key}
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="badge badge-lg badge-info">
                              No Active License
                            </span>
                            <Link href="/membership" className="link link-primary font-medium">
                              Activate or purchase a License →
                            </Link>
                          </>
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

          {/* License Tab */}
          {activeTab === "membership" && (
            <div className="space-y-6">
              {/* Current License Card */}
              <div className="card card-border bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="card-title text-2xl">Current License</h2>
                    {isCheckingLicense ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : hasLicense ? (
                      <span className="badge badge-lg badge-success">
                        {getLicenseDisplayName()}
                      </span>
                    ) : (
                      <span className="badge badge-lg badge-info">
                        No Active License
                      </span>
                    )}
                  </div>
                  
                  {hasLicense && license ? (
                    <div className="space-y-4">
                      <div className="bg-base-200 rounded-lg p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">License Type</span>
                            <span className="text-lg">{getLicenseDisplayName()}</span>
                          </div>
                          {license.max_users && (
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">Max Users</span>
                              <span className="text-lg">{license.max_users}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Status</span>
                            <span className={`text-lg ${isLicenseOwner ? 'text-primary' : 'text-base-content/70'}`}>
                              {isLicenseOwner ? 'Owner' : 'Member'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Expires</span>
                            <span className="text-lg">{getLicenseExpiry()}</span>
                          </div>
                          {license.license_key && (
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">License Key</span>
                              <span className="text-sm font-mono">{license.license_key}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* License Management for Owner */}
                      {isLicenseOwner && (
                        <div className="bg-base-200 rounded-lg p-4">
                          <h3 className="font-semibold mb-3">License Management</h3>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span>Total Users:</span>
                              <span className="font-semibold">{licenseUsers.length + 1} / {license.max_users || 'Unlimited'}</span>
                            </div>
                            {license.license_key && (
                              <div className="bg-base-100 rounded p-3">
                                <label className="label py-1">
                                  <span className="label-text text-xs">Share this license key:</span>
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={license.license_key}
                                    readOnly
                                    className="input input-bordered input-sm flex-1 font-mono text-xs"
                                  />
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(license.license_key);
                                      alert('License key copied to clipboard!');
                                    }}
                                    className="btn btn-sm btn-outline"
                                  >
                                    Copy
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          {licenseUsers.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-semibold text-sm mb-2">License Members:</h4>
                              <div className="space-y-2">
                                {licenseUsers.map((lu) => (
                                  <div key={lu.id} className="flex items-center justify-between bg-base-100 rounded p-2 text-sm">
                                    <span>{lu.profiles?.first_name} {lu.profiles?.last_name} ({lu.profiles?.email})</span>
                                    <span className="text-xs text-base-content/60">
                                      Added {new Date(lu.added_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="mt-4 pt-4 border-t border-base-300">
                            <p className="text-xs text-base-content/60 mb-2">
                              To cancel your subscription, use the Stripe Customer Portal.
                            </p>
                            <Link href="/account" className="btn btn-sm btn-outline">
                              Manage Subscription
                            </Link>
                          </div>
                        </div>
                      )}
                      
                      {/* Leave License for Members */}
                      {!isLicenseOwner && (
                        <div className="bg-base-200 rounded-lg p-4">
                          <p className="text-sm text-base-content/70 mb-3">
                            You are using a shared license. You can leave at any time.
                          </p>
                          <button
                            onClick={handleLeaveLicense}
                            className="btn btn-sm btn-outline btn-error"
                          >
                            Leave License
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Purchase License */}
                      <div className="bg-base-200 rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Purchase a License</h3>
                        <p className="text-base-content/70 mb-4 text-sm">
                          Purchase a license to activate your account and access all premium courses.
                        </p>
                        <Link href="/membership" className="btn btn-primary w-full">
                          Purchase License
                        </Link>
                      </div>
                      
                      {/* Activate Existing License */}
                      <div className="bg-base-200 rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Activate License Key</h3>
                        <p className="text-base-content/70 mb-4 text-sm">
                          Have a license key? Enter it below to activate your account.
                        </p>
                        <form onSubmit={handleActivateLicense}>
                          {activationError && (
                            <div className="alert alert-error mb-3 py-2">
                              <span className="text-sm">{activationError}</span>
                            </div>
                          )}
                          {activationSuccess && (
                            <div className="alert alert-success mb-3 py-2">
                              <span className="text-sm">{activationSuccess}</span>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={licenseKey}
                              onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                              placeholder="ILM-XXXX-XXXX-XXXX"
                              className="input input-bordered flex-1 font-mono"
                              maxLength={20}
                            />
                            <button
                              type="submit"
                              className="btn btn-primary"
                              disabled={isActivating}
                            >
                              {isActivating ? (
                                <>
                                  <span className="loading loading-spinner loading-xs"></span>
                                  Activating...
                                </>
                              ) : (
                                'Activate'
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Features Card */}
              <div className="card card-border bg-base-100">
                <div className="card-body">
                  <h3 className="card-title mb-4">License Benefits</h3>
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
                    Sign out of your account. You&apos;ll need to log in again to access your courses.
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

