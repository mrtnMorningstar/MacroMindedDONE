# MacroMinded Project Structure

## 📁 Folder Organization

```
macrominded/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API routes (Stripe, Resend, etc.)
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin panel
│   ├── dashboard/         # Client dashboard
│   ├── plans/             # Plans/pricing page
│   ├── questionnaire/     # Onboarding flow
│   ├── blog/              # Blog pages
│   ├── contact/           # Contact page
│   ├── checkout/          # Stripe checkout
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles import
│
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components (Navbar, Footer)
│   ├── home/              # Home page components
│   ├── plans/             # Plan-related components
│   └── dashboard/         # Dashboard components
│
├── lib/                   # Utility libraries
│   ├── firebase/          # Firebase config & auth
│   ├── stripe/            # Stripe configuration
│   ├── resend/            # Resend email config
│   ├── emails/            # Email templates
│   └── utils.ts           # Utility functions
│
├── context/               # React Context providers
│   └── auth-context.tsx   # Authentication context
│
├── hooks/                 # Custom React hooks
│   └── use-toast.ts       # Toast notification hook
│
├── types/                 # TypeScript type definitions
│   └── index.ts           # Global types
│
├── styles/                # Global styles
│   └── globals.css        # Tailwind CSS & custom styles
│
├── .env.local             # Environment variables (gitignored)
├── firestore.rules        # Firebase security rules
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── vercel.json            # Vercel deployment config
└── package.json           # Dependencies
```

## 🎨 Design System

- **Theme**: Dark athletic aesthetic
- **Colors**: 
  - Black (#000) - Background
  - Dark Grey (#111/#222) - Secondary backgrounds
  - Red (#FF2E2E) - Primary/Accent
- **Font**: Inter (clean, bold sans-serif)
- **Animations**: Framer Motion

## 🔧 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Icons**: lucide-react
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Payments**: Stripe
- **Emails**: Resend
- **Deployment**: Vercel

## 📦 Key Dependencies

- `next@^15.0.0` - Next.js framework
- `react@^18.3.1` - React library
- `typescript@^5.6.2` - TypeScript
- `tailwindcss@^3.4.13` - Tailwind CSS
- `framer-motion@^11.5.4` - Animations
- `firebase@^10.14.1` - Firebase SDK
- `stripe@^17.0.0` - Stripe SDK
- `resend@^4.0.0` - Resend SDK
- `lucide-react@^0.446.0` - Icons
- `@radix-ui/*` - shadcn/ui components

## 🚀 Deployment

The project is configured for Vercel deployment with:
- Automatic builds
- Environment variable support
- Serverless functions for API routes
- Edge runtime support

