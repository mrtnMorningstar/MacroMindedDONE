import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/auth-context";
import { PageTransition } from "@/components/layout/page-transition";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MacroMinded - Real Plans. Real Results.",
  description: "Professional custom meal plans created by nutrition experts to help you lose, gain, or maintain weight.",
  keywords: ["meal plans", "nutrition", "diet", "macros", "weight loss", "weight gain"],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-[#000] text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <Toaster />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}

