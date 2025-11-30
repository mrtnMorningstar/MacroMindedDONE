# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Firebase Project**: Set up Firebase Authentication and Firestore
4. **Stripe Account**: Set up Stripe for payments
5. **Resend Account**: Set up Resend for emails

## Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/macrominded.git
git push -u origin main
```

## Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

## Step 3: Configure Environment Variables

In your Vercel project dashboard, go to **Settings → Environment Variables** and add:

### Firebase Configuration
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Stripe Configuration
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_ELITE_PRICE_ID=price_...
```

### Resend Configuration
```
RESEND_API_KEY=re_...
```

### Admin Configuration
```
ADMIN_EMAIL=admin@macrominded.com
```

### App URL
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

**Important**: 
- Use **Production** environment for all variables
- Replace test keys with live keys for production
- Update `NEXT_PUBLIC_APP_URL` with your actual Vercel domain

## Step 4: Configure Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication → Sign-in method**
4. Enable **Email/Password** authentication
5. Enable **Google** authentication:
   - Click on Google
   - Enable it
   - Add your OAuth consent screen details
   - Add authorized domains: `your-domain.vercel.app`

## Step 5: Configure Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Endpoint URL: `https://your-domain.vercel.app/api/webhook`
4. Select events: `checkout.session.completed`
5. Copy the webhook signing secret
6. Add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

## Step 6: Configure Resend Domain

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Add your domain
3. Verify DNS records
4. Update email "from" addresses in `lib/emails/send.ts` to use your domain

## Step 7: Deploy

1. Click **"Deploy"** in Vercel
2. Wait for build to complete
3. Your site will be live at `https://your-project.vercel.app`

## Step 8: Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings → Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain

## Post-Deployment Checklist

- [ ] Test authentication (email/password and Google)
- [ ] Test Stripe checkout flow
- [ ] Test email notifications
- [ ] Verify Firebase security rules are deployed
- [ ] Check Vercel Analytics is working
- [ ] Test responsive design on mobile/tablet
- [ ] Verify all environment variables are set
- [ ] Test protected routes (Dashboard, Admin)
- [ ] Verify blog posts load from Firebase

## Troubleshooting

### Build Errors
- Check all environment variables are set
- Verify Firebase config is correct
- Check Next.js version compatibility

### Authentication Issues
- Verify Firebase Authentication is enabled
- Check authorized domains in Firebase
- Verify OAuth redirect URIs

### Payment Issues
- Verify Stripe keys are correct (live vs test)
- Check webhook endpoint is accessible
- Verify webhook secret matches

### Email Issues
- Verify Resend API key is correct
- Check domain is verified in Resend
- Verify "from" email addresses

## Performance Optimization

The project includes:
- ✅ Image optimization with Next.js Image component
- ✅ Lazy loading for blog images
- ✅ Code splitting with dynamic imports
- ✅ Vercel Analytics integration
- ✅ Compressed assets
- ✅ SWC minification

## Monitoring

- **Vercel Analytics**: Automatic page view tracking
- **Vercel Speed Insights**: Performance monitoring (optional)
- **Firebase Console**: User authentication and database monitoring
- **Stripe Dashboard**: Payment and webhook monitoring

## Security Notes

- Never commit `.env.local` to Git
- Use environment variables for all secrets
- Keep Firebase security rules up to date
- Regularly rotate API keys
- Use HTTPS only (Vercel provides this automatically)

