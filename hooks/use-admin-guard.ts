"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";

function isAdminEmail(email?: string | null) {
  const envAdmin = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase()?.trim();
  return !!email && !!envAdmin && email.toLowerCase() === envAdmin;
}

export function useAdminGuard() {
  const { user, userData, loading } = useAuth();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Timeout to prevent infinite loading (10 seconds max)
    const timeoutId = setTimeout(() => {
      if (checking) {
        console.warn("Admin guard check timed out");
        setChecking(false);
      }
    }, 10000);

    if (loading) {
      return () => clearTimeout(timeoutId);
    }

    setChecking(false);
    clearTimeout(timeoutId);

    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname || "/admin")}`);
      return;
    }

    const envAdmin = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase();
    const isEnvAdmin = !!envAdmin && user.email?.toLowerCase() === envAdmin;
    const isRoleAdmin = (userData?.role ?? "").toLowerCase() === "admin";

    if (isEnvAdmin || isRoleAdmin) {
      setAllowed(true);
    } else {
      router.push("/dashboard");
    }
  }, [loading, user, userData, router, pathname, checking]);

  return { allowed, loading: loading || checking };
}

