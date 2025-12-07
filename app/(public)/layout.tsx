"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageTransition } from "@/components/layout/page-transition";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white relative">
      <Navbar />
      <main className="flex-1 w-full overflow-x-hidden">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}

