"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { isAdminUser } from "@/lib/utils/admin";

export function withAdminAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AdminAuthenticatedComponent(props: P) {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.push("/auth/login?redirect=" + encodeURIComponent(window.location.pathname));
          return;
        }

        const checkAdmin = async () => {
          const admin = isAdminUser(user, userData);
          setIsAdmin(admin);
          setChecking(false);

          if (!admin) {
            router.push("/dashboard");
          }
        };

        checkAdmin();
      }
    }, [user, userData, loading, router]);

    if (loading || checking) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF2E2E] mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user || !isAdmin) {
      return null;
    }

    return <Component {...props} />;
  };
}

