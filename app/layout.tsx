import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/auth-context";
import { Analytics } from "@vercel/analytics/react";
import { ChatWidget } from "@/components/chat/chat-widget";

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
      <body className="min-h-screen flex flex-col bg-black text-white overflow-x-hidden overflow-y-scroll">
        <AuthProvider>
          {children}
          <Suspense fallback={null}>
            <ChatWidget />
          </Suspense>
          <Toaster />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}

