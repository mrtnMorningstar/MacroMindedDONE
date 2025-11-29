# MacroMinded

A professional, interactive platform offering human-created custom meal plans to help clients lose, gain, or maintain weight.

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Hosting:** Vercel
- **Database & Auth:** Firebase (Firestore + Firebase Auth)
- **Payments:** Stripe (one-time purchases)
- **Emails:** Resend (transactional messages)
- **Styling:** Tailwind CSS + shadcn/ui + Framer Motion
- **Icons:** lucide-react

## 🎨 Design System

- **Theme:** Dark athletic aesthetic
- **Colors:** Black (#000), Dark Grey (#111/#222), Red (#FF2E2E)
- **Font:** Inter (clean, bold sans-serif)
- **Animations:** Framer Motion for smooth transitions

## 📋 Features

### Core Pages
1. **Home Page** - Hero, How It Works, Macro Calculator, Testimonials
2. **Plans Page** - Three tiers (Basic, Pro, Elite) with Stripe checkout
3. **Questionnaire** - Step-by-step onboarding wizard
4. **Client Dashboard** - Plan display, chat, payment history
5. **Admin Panel** - User management, plan upload, chat management
6. **Blog** - Dynamic blog posts with Firebase CMS
7. **Contact** - Contact form with Resend integration

### Key Features
- Firebase Authentication
- Stripe payment processing with webhooks
- Real-time chat system
- Email notifications (Resend)
- Responsive design
- SEO optimized
- Loading skeletons
- Toast notifications

## 🛠️ Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file based on `.env.local.example`:
   ```env
   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_key
   STRIPE_SECRET_KEY=your_secret
   NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET=your_webhook_secret
   NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=your_price_id
   NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=your_price_id
   NEXT_PUBLIC_STRIPE_ELITE_PRICE_ID=your_price_id

   # Resend
   RESEND_API_KEY=your_key

   # Admin
   ADMIN_EMAIL=admin@macrominded.com

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Set up Firebase:**
   - Create a Firebase project
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Deploy security rules from `firestore.rules`

4. **Set up Stripe:**
   - Create Stripe account
   - Create products and prices for Basic, Pro, Elite plans
   - Set up webhook endpoint: `/api/webhook`
   - Add webhook secret to environment variables

5. **Set up Resend:**
   - Create Resend account
   - Verify domain
   - Add API key to environment variables

6. **Run development server:**
   ```bash
   npm run dev
   ```

7. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── blog/              # Blog pages
│   ├── dashboard/         # Client dashboard
│   ├── admin/             # Admin panel
│   └── ...
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   ├── home/             # Home page components
│   └── ...
├── lib/                   # Utility libraries
│   ├── firebase/         # Firebase config & auth
│   ├── stripe/           # Stripe config
│   ├── resend/           # Resend config
│   └── emails/           # Email templates
└── hooks/                 # Custom React hooks
```

## 🔐 Security

- Firebase security rules protect user data
- Admin access restricted by role/email
- Stripe webhook signature verification
- Environment variables for sensitive data

## 📧 Email Templates

Email templates are located in `lib/emails/templates.ts`:
- Welcome email (after registration)
- Payment confirmation
- Plan ready notification
- Admin reply notification

## 🚢 Deployment

1. **Deploy to Vercel:**
   - Connect your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy automatically on push

2. **Configure Stripe Webhook:**
   - Point webhook URL to: `https://yourdomain.com/api/webhook`
   - Add webhook secret to environment variables

3. **Update Firebase rules:**
   - Deploy `firestore.rules` to Firebase

## 📝 License

Private - All rights reserved

## 🤝 Support

For support, email info@macrominded.com or use the contact form on the website.

