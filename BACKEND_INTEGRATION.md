# Backend Integration Guide

## ✅ Complete Backend Setup

The MacroMinded backend is fully integrated with Firebase, Stripe, and Resend.

## 📁 File Structure

```
lib/
├── firebaseConfig.ts      # Firebase initialization (Auth, Firestore, Storage)
├── firebaseUtils.ts       # Helper functions for Firestore operations
├── stripe.ts              # Stripe initialization
├── resend.ts              # Resend email service
└── hocs/
    ├── withAuth.tsx       # Route protection HOC for authenticated users
    └── withAdminAuth.tsx  # Route protection HOC for admin users

emails/
├── welcomeEmail.ts        # Welcome email template
├── paymentConfirmation.ts # Payment confirmation email template
├── planReady.ts           # Plan ready notification template
└── adminReply.ts          # Admin reply notification template

app/api/
├── checkout/route.ts      # Stripe checkout session creation
├── webhook/route.ts       # Stripe webhook handler
├── emails/
│   ├── welcome/route.ts   # Welcome email API
│   └── plan-ready/route.ts # Plan ready email API
└── chat/notify/route.ts   # Admin reply notification API
```

## 🔥 Firebase Configuration

### `lib/firebaseConfig.ts`
- Initializes Firebase App, Auth, Firestore, and Storage
- Exports: `auth`, `db`, `storage`
- Client-side only initialization

### `lib/firebaseUtils.ts`
Helper functions for Firestore operations:

**User Functions:**
- `createUserProfile(uid, data)` - Create user document
- `getUserData(uid)` - Get user data
- `updateUserData(uid, data)` - Update user data

**Plan Functions:**
- `createPlan(data)` - Create meal plan document
- `getUserPlans(userId)` - Get all plans for a user

**Message Functions:**
- `createMessage(data)` - Create chat message
- `getUserMessages(userId)` - Get all messages for a user
- `markMessageAsRead(messageId)` - Mark message as read

**Payment Functions:**
- `createPayment(data)` - Create payment record
- `getUserPayments(userId)` - Get all payments for a user

## 💳 Stripe Integration

### `lib/stripe.ts`
- Initializes Stripe with `STRIPE_SECRET_KEY`
- Exports configured `stripe` instance

### `app/api/checkout/route.ts`
**POST** `/api/checkout`
- Accepts: `{ planId, userId, couponCode? }`
- Creates Stripe Checkout session
- Returns: `{ url: session.url }`
- Redirects to `/questionnaire` on success

### `app/api/webhook/route.ts`
**POST** `/api/webhook`
- Verifies Stripe webhook signature
- Handles `checkout.session.completed` events
- Creates payment record in Firestore
- Updates user plan status
- Sends payment confirmation email

## 📧 Resend Integration

### `lib/resend.ts`
- Initializes Resend with `RESEND_API_KEY`
- Exports `sendEmail({ to, subject, html, from? })` helper

### Email Templates (`emails/`)
All templates return branded HTML with:
- Dark background (#000)
- Red accents (#FF2E2E)
- White text
- Responsive design

**Templates:**
1. `welcomeEmail(name, appUrl)` - Welcome email after signup
2. `paymentConfirmation(name, planType, amount, appUrl)` - Payment receipt
3. `planReady(name, appUrl)` - Plan delivery notification
4. `adminReply(name, messagePreview?, appUrl)` - Admin message notification

## 🔐 Authentication

### Auth Context (`context/auth-context.tsx`)
- Uses Firebase `onAuthStateChanged`
- Provides: `user`, `userData`, `loading`
- Automatically fetches user data from Firestore

### Route Protection HOCs

**`withAuth`** - Protects user-only routes
- Redirects to login if not authenticated
- Shows loading state during auth check

**`withAdminAuth`** - Protects admin-only routes
- Checks Firebase role and admin emails
- Redirects to dashboard if not admin

### Admin Access
Admin emails configured via `ADMIN_EMAILS` environment variable (comma-separated):
```
ADMIN_EMAILS=admin@macrominded.com,other@domain.com
```

## 🗄️ Firestore Data Model

### `users` Collection
```typescript
{
  uid: string
  name: string
  email: string
  planType?: string
  goal?: string
  questionnaireResponses?: any
  planStatus?: "Pending" | "In Progress" | "Delivered"
  role?: "client" | "admin"
  createdAt: string
  updatedAt?: string
}
```

### `plans` Collection
```typescript
{
  userId: string
  fileUrl?: string
  uploadedBy: string
  createdAt: string
}
```

### `messages` Collection
```typescript
{
  userId: string
  sender: "admin" | "user"
  text: string
  timestamp: string
  read: boolean
}
```

### `payments` Collection
```typescript
{
  userId: string
  planType: string
  amount: number
  stripeSessionId: string
  timestamp: string
  status: "completed"
}
```

## 🌍 Environment Variables

See `.env.example` for complete list:

**Firebase:**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**Stripe:**
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID`
- `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`
- `NEXT_PUBLIC_STRIPE_ELITE_PRICE_ID`

**Resend:**
- `RESEND_API_KEY`

**Admin:**
- `ADMIN_EMAILS` (comma-separated)

**App:**
- `NEXT_PUBLIC_APP_URL`

## 🔄 Integration Flow

### 1. User Signup
1. User signs up → Firebase Auth
2. `createUserProfile()` creates Firestore document
3. Welcome email sent via Resend

### 2. Payment Flow
1. User selects plan → `/api/checkout`
2. Stripe Checkout session created
3. User completes payment
4. Stripe webhook → `/api/webhook`
5. Payment saved to Firestore
6. User plan status updated
7. Payment confirmation email sent

### 3. Plan Delivery
1. Admin uploads plan → Updates Firestore
2. User plan status → "Delivered"
3. Plan ready email sent

### 4. Chat System
1. User sends message → Firestore `messages` collection
2. Admin replies → Firestore
3. If user offline → Admin reply email sent

## 🛡️ Security

- Firebase Security Rules deployed (`firestore.rules`)
- Admin access controlled via environment variables
- Stripe webhook signature verification
- Route protection via HOCs
- Client-side auth checks in protected pages

## ✅ Testing Checklist

- [ ] Firebase Authentication (email/password + Google)
- [ ] User profile creation in Firestore
- [ ] Stripe checkout flow
- [ ] Webhook payment processing
- [ ] Email notifications (welcome, payment, plan ready, admin reply)
- [ ] Route protection (dashboard, admin)
- [ ] Admin access control
- [ ] Chat message creation
- [ ] Plan upload and delivery

## 🚀 Deployment

1. Set all environment variables in Vercel
2. Deploy Firebase Security Rules
3. Configure Stripe webhook endpoint
4. Verify Resend domain
5. Test all flows in production

