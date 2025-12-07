# MacroMinded App Directory Structure

## Final /app Directory Tree

```
app/
├── (dashboard)/                    # Dashboard route group
│   ├── layout.tsx                 # Sidebar + TopBar layout
│   └── dashboard/
│       ├── page.tsx               # /dashboard
│       ├── plan/
│       │   └── page.tsx          # /dashboard/plan
│       ├── chat/
│       │   └── page.tsx          # /dashboard/chat
│       └── payments/
│           └── page.tsx          # /dashboard/payments
│
├── (public)/                       # Public route group
│   ├── layout.tsx                 # Navbar + Footer layout
│   ├── page.tsx                   # / (Home)
│   ├── plans/
│   │   └── page.tsx              # /plans
│   ├── blog/
│   │   ├── page.tsx             # /blog
│   │   ├── metadata.ts
│   │   └── [slug]/
│   │       ├── page.tsx         # /blog/[slug]
│   │       └── metadata.ts
│   ├── contact/
│   │   ├── layout.tsx
│   │   └── page.tsx             # /contact
│   ├── questionnaire/
│   │   ├── layout.tsx
│   │   └── page.tsx             # /questionnaire
│   ├── checkout/
│   │   └── page.tsx             # /checkout
│   └── auth/
│       ├── login/
│       │   └── page.tsx         # /auth/login
│       └── signup/
│           └── page.tsx          # /auth/signup
│
├── admin/                          # Admin panel (separate layout)
│   ├── layout.tsx
│   └── page.tsx                   # /admin
│
├── api/                            # API routes
│   ├── checkout/
│   ├── webhook/
│   ├── contact/
│   └── ...
│
├── globals.css
└── layout.tsx                      # Root layout (minimal)
```

## Layout Files

### 1. `/app/layout.tsx` (Root Layout - Minimal)
```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/auth-context";
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
      <body className="bg-black text-white">
        <AuthProvider>
          {children}
          <Toaster />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 2. `/app/(public)/layout.tsx` (Public Layout - Navbar + Footer)
```typescript
"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Navbar />
      <motion.main
        className="flex-grow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}
```

### 3. `/app/(dashboard)/layout.tsx` (Dashboard Layout - Sidebar + TopBar)
```typescript
"use client";

import { motion } from "framer-motion";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopBar } from "@/components/dashboard/top-bar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#0b0b0b] text-white overflow-hidden">
      <DashboardSidebar />
      <div className="flex flex-col flex-grow">
        <DashboardTopBar />
        <main className="flex-grow overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
```

## Route Mapping

### Public Routes (Navbar + Footer)
- `/` → Home page
- `/plans` → Plans page
- `/blog` → Blog listing
- `/blog/[slug]` → Blog posts
- `/contact` → Contact page
- `/questionnaire` → Questionnaire
- `/checkout` → Checkout
- `/auth/login` → Login
- `/auth/signup` → Signup

### Dashboard Routes (Sidebar + TopBar)
- `/dashboard` → Dashboard home
- `/dashboard/plan` → My Plan
- `/dashboard/chat` → Chat
- `/dashboard/payments` → Payments

### Admin Routes (Separate layout)
- `/admin` → Admin panel

## Verification Checklist

✅ All dashboard routes moved to `(dashboard)/dashboard/`
✅ All public pages moved to `(public)/`
✅ No duplicate folders at root level
✅ Root layout is minimal (only html/body with global providers)
✅ Public layout includes Navbar + Footer
✅ Dashboard layout includes Sidebar + TopBar
✅ All imports use `@/components/...` correctly
✅ No layout conflicts or overlapping elements

