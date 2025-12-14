"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { hasActiveSession, getUser, logout } from "@/libs/auth";

export default function AuthButton({ extraStyle = "" }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (hasActiveSession()) {
      setIsLoggedIn(true);
      setUser(getUser());
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
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

