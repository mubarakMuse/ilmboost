"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { hasActiveSession, getUser, logout, hasActiveLicense } from "@/libs/auth";

export default function AuthButton({ extraStyle = "" }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [hasLicense, setHasLicense] = useState(false);

  useEffect(() => {
    const checkLicense = async () => {
      if (hasActiveSession()) {
        setIsLoggedIn(true);
        const userData = getUser();
        setUser(userData);
        
        // Check if user has a license
        if (userData?.id) {
          const licenseCheck = await hasActiveLicense();
          setHasLicense(licenseCheck);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setHasLicense(false);
      }
    };
    
    checkLicense();
  }, []);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUser(null);
    router.push('/');
  };

  if (isLoggedIn) {
    return (
      <div className="dropdown dropdown-end">
        <label tabIndex={0} className={`btn ${extraStyle}`}>
          {user?.firstName || 'Account'}
        </label>
        <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
          <li>
            <Link href="/dashboard">Dashboard</Link>
          </li>
          {hasLicense && (
            <li>
              <Link href="/benefits">Member Benefits</Link>
            </li>
          )}
          <li>
            <Link href="/account">Account Settings</Link>
          </li>
          <li>
            <button onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <Link href="/login" className={`btn ${extraStyle}`}>
      Login
    </Link>
  );
}

