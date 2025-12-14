"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect old signin page to new login page
export default function SigninPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  );
}
