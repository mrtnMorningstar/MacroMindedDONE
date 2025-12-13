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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "MacroMinded - Real Plans. Real Results.",
  description:
    "Your personalized nutrition and fitness AI coach. Track progress, receive weekly insights, and stay consistent.",
  keywords: [
    "meal plans",
    "nutrition",
    "diet",
    "macros",
    "weight loss",
    "weight gain",
    "fitness",
    "AI coach",
    "nutrition coach",
    "meal planning",
  ],
  openGraph: {
    title: "MacroMinded AI Fitness",
    description: "Your personalized nutrition and fitness platform for measurable results.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://macrominded.net",
    siteName: "MacroMinded",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MacroMinded - Real Plans. Real Results.",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MacroMinded AI Fitness",
    description: "Professional custom plans built for real results.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
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

