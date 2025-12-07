"use client";

import { Suspense } from "react";
import { useAdminGuard } from "@/hooks/use-admin-guard";
import { AdminLayout as AdminLayoutComponent } from "@/components/admin/layout/admin-layout";
import { SkeletonCard } from "@/components/admin/shared/skeleton";
import { ThemeProvider } from "@/context/theme-context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { allowed, loading } = useAdminGuard();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0b0b] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF2E2E] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading admin panel...</p>
          <p className="text-gray-500 text-sm mt-2">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0b0b] text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">You don't have permission to access this page.</p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white rounded-lg transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Suspense fallback={<SkeletonCard />}>
        <AdminLayoutComponent>{children}</AdminLayoutComponent>
      </Suspense>
    </ThemeProvider>
  );
}
