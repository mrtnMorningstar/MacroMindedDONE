# Admin Login Guide

## How Admin Access Works

Admin access is determined by checking:
1. **Firebase user role** - If `userData.role === "admin"`
2. **Environment variable** - If your email is in `ADMIN_EMAILS` or `NEXT_PUBLIC_ADMIN_EMAILS`
3. **Single admin email** - If your email matches `ADMIN_EMAIL` or `NEXT_PUBLIC_ADMIN_EMAIL`

## Method 1: Using Environment Variable (Recommended)

### Step 1: Sign Up/Login
1. Go to `/auth/signup` or `/auth/login`
2. Create an account or login with your email
3. Note your email address

### Step 2: Add Email to Environment Variables

**For Local Development:**

Add to `.env.local`:
```env
ADMIN_EMAILS=your-email@example.com,another-admin@example.com
```

Or for a single admin:
```env
ADMIN_EMAIL=your-email@example.com
```

**For Production (Vercel):**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - **Name:** `ADMIN_EMAILS`
   - **Value:** `your-email@example.com,another-admin@example.com`
   - **Environment:** Production (and Preview if needed)
3. Click **"Save"**
4. **Redeploy** your application

### Step 3: Access Admin Panel

1. Make sure you're logged in with the admin email
2. Navigate to `/admin`
3. You should now have access to the admin panel

## Method 2: Using Firebase Role

### Step 1: Sign Up/Login
1. Go to `/auth/signup` or `/auth/login`
2. Create an account or login with your email

### Step 2: Update User Role in Firestore

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to **Firestore Database**
3. Find the `users` collection
4. Find your user document (by your user ID)
5. Edit the document and add:
   ```json
   {
     "role": "admin"
   }
   ```
6. Save the document

### Step 3: Access Admin Panel

1. Refresh your browser or logout/login again
2. Navigate to `/admin`
3. You should now have access

## Quick Setup (Local Development)

1. **Sign up** with your email at `/auth/signup`
2. **Add to `.env.local`:**
   ```env
   ADMIN_EMAILS=your-email@example.com
   ```
3. **Restart your dev server:**
   ```bash
   npm run dev
   ```
4. **Login** and go to `/admin`

## Verify Admin Access

You can check if you have admin access by:

1. **Check the console** - Look for any "Access Denied" messages
2. **Try accessing `/admin`** - If you're redirected to dashboard, you're not an admin
3. **Check your user data** - In Firebase Console, check if `role: "admin"` exists

## Troubleshooting

### "Access Denied" Error

1. **Check your email matches exactly** (case-sensitive)
2. **Verify environment variable is set** - Check `.env.local` or Vercel settings
3. **Restart dev server** after changing `.env.local`
4. **Redeploy** after changing Vercel environment variables
5. **Check Firebase role** - Verify `role: "admin"` in Firestore

### Can't Access Admin Panel

1. **Make sure you're logged in** - Check `/dashboard` first
2. **Check browser console** for errors
3. **Verify email in environment variable** matches your login email exactly
4. **Try logging out and back in** after setting admin email

### Multiple Admins

To add multiple admins, use comma-separated emails:

```env
ADMIN_EMAILS=admin1@example.com,admin2@example.com,admin3@example.com
```

## Security Notes

⚠️ **Important:**
- Never commit `.env.local` to git (it's already in `.gitignore`)
- Use different admin emails for development and production
- Regularly review who has admin access
- Consider using Firebase Custom Claims for more secure role management in the future

## Current Admin Check Logic

The system checks in this order:
1. ✅ Firebase `role === "admin"` in user document
2. ✅ Email in `ADMIN_EMAILS` environment variable (comma-separated)
3. ✅ Email matches `ADMIN_EMAIL` environment variable

If any of these match, you get admin access.

