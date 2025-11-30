# Stripe Webhook Setup Guide

## Overview
Stripe webhooks allow your application to receive real-time notifications about payment events. This guide covers both **local development** and **production** setups.

## What Events We're Listening For

Your webhook handler (`app/api/webhook/route.ts`) currently listens for:
- `checkout.session.completed` - When a customer completes a payment

## Local Development Setup

### Step 1: Install Stripe CLI

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows (using Scoop):**
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Linux:**
```bash
# Download the latest release
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_*_linux_x86_64.tar.gz
tar -xvf stripe_*_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin
```

### Step 2: Login to Stripe CLI

```bash
stripe login
```

This will open your browser to authenticate with Stripe.

### Step 3: Forward Webhooks to Local Server

In a **separate terminal window**, run:

```bash
stripe listen --forward-to localhost:3001/api/webhook
```

**Important:** Keep this terminal running while developing!

The CLI will output a webhook signing secret that looks like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

### Step 4: Add Webhook Secret to Environment Variables

Copy the webhook signing secret and add it to your `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Step 5: Test the Webhook

1. Make a test payment on your local site
2. You should see events in the Stripe CLI terminal
3. Check your application logs for webhook processing

**Trigger a test event manually:**
```bash
stripe trigger checkout.session.completed
```

## Production Setup (Vercel)

### Step 1: Get Your Production Webhook Endpoint URL

Your webhook endpoint will be:
```
https://your-domain.com/api/webhook
```

### Step 2: Create Webhook in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks**
3. Click **"Add endpoint"**
4. Enter your endpoint URL: `https://your-domain.com/api/webhook`
5. Select events to listen for:
   - `checkout.session.completed`
6. Click **"Add endpoint"**

### Step 3: Get Webhook Signing Secret

1. After creating the endpoint, click on it
2. Click **"Reveal"** next to "Signing secret"
3. Copy the secret (starts with `whsec_`)

### Step 4: Add to Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - **Name:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_xxxxxxxxxxxxx` (from Step 3)
   - **Environment:** Production (and Preview if needed)
4. Click **"Save"**
5. **Redeploy** your application for changes to take effect

### Step 5: Test Production Webhook

1. Make a test payment on your production site
2. Go to Stripe Dashboard → **Developers** → **Webhooks**
3. Click on your webhook endpoint
4. View the **"Events"** tab to see incoming webhooks
5. Check for any failed deliveries

## Testing Webhooks

### Test with Stripe CLI

```bash
# Test checkout completion
stripe trigger checkout.session.completed

# Test other events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

### Test with Stripe Dashboard

1. Go to **Developers** → **Webhooks**
2. Click on your endpoint
3. Click **"Send test webhook"**
4. Select event type: `checkout.session.completed`
5. Click **"Send test webhook"**

## Troubleshooting

### Webhook Not Receiving Events

1. **Check endpoint URL is correct**
   - Local: `http://localhost:3001/api/webhook`
   - Production: `https://your-domain.com/api/webhook`

2. **Verify webhook secret is set**
   ```bash
   # Check .env.local has STRIPE_WEBHOOK_SECRET
   ```

3. **Check Stripe CLI is running** (local only)
   ```bash
   stripe listen --forward-to localhost:3001/api/webhook
   ```

4. **Check webhook logs in Stripe Dashboard**
   - Go to **Developers** → **Webhooks** → Your endpoint → **Events**

### Webhook Signature Verification Failing

- Ensure `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe
- For local: Use the secret from `stripe listen` command
- For production: Use the secret from Stripe Dashboard

### Webhook Returns 400/500 Errors

1. Check your server logs for errors
2. Verify your webhook handler code (`app/api/webhook/route.ts`)
3. Ensure Firestore is accessible and indexes are created
4. Check that all required environment variables are set

## Security Best Practices

1. **Always verify webhook signatures** ✅ (Already implemented)
2. **Use HTTPS in production** ✅ (Vercel handles this)
3. **Keep webhook secrets secure** - Never commit to git
4. **Use different secrets for dev/prod** - Create separate webhook endpoints
5. **Monitor webhook failures** - Set up alerts in Stripe Dashboard

## Current Webhook Handler

Your webhook handler (`app/api/webhook/route.ts`) does the following:

1. ✅ Verifies webhook signature
2. ✅ Handles `checkout.session.completed` events
3. ✅ Creates payment record in Firestore
4. ✅ Updates user plan status
5. ✅ Sends payment confirmation email

## Additional Events You Might Want

Consider adding these events in the future:

- `payment_intent.succeeded` - Alternative payment confirmation
- `payment_intent.payment_failed` - Handle failed payments
- `customer.subscription.created` - If you add subscriptions later
- `customer.subscription.deleted` - Handle cancellations

## Quick Reference

### Local Development
```bash
# Terminal 1: Start your Next.js app
npm run dev

# Terminal 2: Forward webhooks
stripe listen --forward-to localhost:3001/api/webhook
```

### Production
1. Create webhook endpoint in Stripe Dashboard
2. Add `STRIPE_WEBHOOK_SECRET` to Vercel environment variables
3. Redeploy application

## Need Help?

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Stripe Webhook Testing Guide](https://stripe.com/docs/webhooks/test)

