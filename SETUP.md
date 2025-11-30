# MacroMinded Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create `.env.local` with the following variables:

   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Stripe Configuration
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=price_...
   NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...
   NEXT_PUBLIC_STRIPE_ELITE_PRICE_ID=price_...

   # Resend Configuration
   RESEND_API_KEY=re_...

   # Admin Configuration
   ADMIN_EMAIL=admin@macrominded.com

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Firebase Setup**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Copy your config values to `.env.local`
   - Deploy security rules: `firebase deploy --only firestore:rules` (or upload `firestore.rules` manually)

4. **Stripe Setup**
   - Create account at [Stripe](https://stripe.com)
   - Create three products: Basic ($49), Pro ($99), Elite ($149)
   - Copy Price IDs to `.env.local`
   - Set up webhook endpoint: `https://yourdomain.com/api/webhook`
   - Add webhook secret to `.env.local`

5. **Resend Setup**
   - Create account at [Resend](https://resend.com)
   - Verify your domain
   - Copy API key to `.env.local`

6. **Run Development Server**
   ```bash
   npm run dev
   ```

## Project Structure

```
├── app/                      # Next.js 15 App Router
│   ├── api/                 # API routes
│   │   ├── checkout/        # Stripe checkout
│   │   ├── webhook/         # Stripe webhook
│   │   └── contact/         # Contact form
│   ├── auth/                # Auth pages
│   │   ├── login/
│   │   └── signup/
│   ├── blog/                # Blog pages
│   ├── dashboard/           # Client dashboard
│   ├── admin/               # Admin panel
│   ├── plans/               # Plans page
│   ├── questionnaire/       # Onboarding
│   ├── checkout/            # Checkout page
│   └── contact/             # Contact page
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── layout/              # Navbar, Footer
│   ├── home/                # Home page components
│   ├── plans/               # Plan components
│   └── dashboard/           # Dashboard components
├── lib/                     # Utilities
│   ├── firebase/            # Firebase config & auth
│   ├── stripe/               # Stripe config
│   ├── resend/               # Resend config
│   └── emails/              # Email templates
└── hooks/                   # Custom hooks
```

## Key Features

✅ **Authentication** - Firebase Auth with email/password  
✅ **Payments** - Stripe one-time checkout with webhooks  
✅ **Real-time Chat** - Firestore-based messaging  
✅ **Email Notifications** - Resend integration  
✅ **Admin Panel** - User and plan management  
✅ **Responsive Design** - Mobile-first approach  
✅ **Animations** - Framer Motion throughout  
✅ **SEO Optimized** - Metadata on all pages  

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Stripe Webhook Setup

After deployment, configure Stripe webhook:
- URL: `https://yourdomain.com/api/webhook`
- Events: `checkout.session.completed`
- Copy webhook secret to Vercel environment variables

## Admin Access

To access the admin panel, you have three options:

1. **Set Firebase Role (Recommended)**
   - In Firestore, go to the `users` collection
   - Find your user document
   - Add or update the `role` field to `"admin"`

2. **Use Admin Email**
   - Set `ADMIN_EMAIL` in your `.env.local` file
   - Use that email address to sign in

3. **Default Admin Email**
   - Use `admin@macrominded.com` (fallback option)

**Note:** The admin panel checks all three methods. Once you have admin access, you can:
- View all users with their plan status and payment info
- Upload meal plans (text) to users
- Reply to client messages via chat
- Toggle user plan status (Pending, In Progress, Delivered)
- Search users by name or email

## Support

For issues or questions, check the README.md or contact support.

