"use client";

import { usePathname } from "next/navigation";
import { GlobalSidebar } from "./global-sidebar";
import { GlobalTopBar } from "./global-top-bar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  // Pages that should NOT show the sidebar/top bar
  const hideLayoutPages = [
    "/auth/login",
    "/auth/signup",
    "/checkout",
  ];

  const shouldHideLayout = hideLayoutPages.some((page) =>
    pathname?.startsWith(page)
  );

  if (shouldHideLayout) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-[#0b0b0b]">
      {/* Sidebar */}
      <GlobalSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* Top Bar */}
        <GlobalTopBar />

        {/* Content with subtle gradient overlay */}
        <main className="flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[#FF2E2E]/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </div>
  );
}

