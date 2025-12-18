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
  const [isOpen, setIsOpen] = useState(false);

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
    setIsOpen(false);
    router.push('/');
  };

  if (isLoggedIn) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-black transition-colors font-medium text-black"
        >
          <span>{user?.firstName || 'Account'}</span>
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-black rounded-xl shadow-lg z-50">
              <div className="py-2">
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                {hasLicense && (
                  <Link
                    href="/benefits"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Member Benefits
                  </Link>
                )}
                <Link
                  href="/account"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Account Settings
                </Link>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link 
        href="/signup" 
        className="px-4 py-2 bg-[#F5E6D3] hover:bg-[#E8D4B8] text-black font-medium rounded-lg transition-colors"
      >
        Sign Up
      </Link>
      <Link 
        href="/login" 
        className="px-4 py-2 bg-white hover:bg-gray-50 text-black font-medium border-2 border-black rounded-lg transition-colors"
      >
        Log In
      </Link>
    </div>
  );
}
