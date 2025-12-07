# MacroMinded Admin - Deployment Guide

## 🚀 Pre-Deployment Checklist

### 1. Environment Variables

Ensure all required environment variables are set in Vercel:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Admin Access
NEXT_PUBLIC_ADMIN_EMAIL=admin@yourdomain.com

# Stripe (if using)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Resend (if using)
RESEND_API_KEY=re_...

# Vercel Analytics (optional)
VERCEL_ANALYTICS_ID=your_id
```

### 2. Firebase Setup

#### Firestore Rules

Deploy the rules from `firestore.rules`:

```bash
firebase deploy --only firestore:rules
```

#### Firestore Indexes

Deploy the indexes from `firestore.indexes.json`:

```bash
firebase deploy --only firestore:indexes
```

Or create them manually in Firebase Console:
- `users`: `planStatus ASC, createdAt DESC`
- `payments`: `createdAt DESC, planType ASC`
- `messages`: `userId ASC, timestamp ASC`
- `plans`: `createdAt DESC`
- `systemLogs`: `timestamp DESC, type ASC`

### 3. Firebase Storage Rules

Ensure Storage rules allow admin uploads:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /plans/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.uid == userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin");
    }
  }
}
```

### 4. Admin User Setup

1. Create your admin user account via signup/login
2. In Firestore Console, navigate to `users/{your-uid}`
3. Set `role: "admin"` OR set `NEXT_PUBLIC_ADMIN_EMAIL` to your email
4. Verify access to `/admin` routes

### 5. Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set all environment variables in Vercel Dashboard
3. Deploy (Vercel will auto-detect Next.js)
4. Verify build completes successfully

### 6. Post-Deployment Verification

#### Admin Routes
- [ ] `/admin` loads and shows dashboard
- [ ] `/admin/users` lists users correctly
- [ ] `/admin/plans` shows plans grid
- [ ] `/admin/payments` displays transactions
- [ ] `/admin/insights` shows analytics
- [ ] `/admin/settings` allows configuration

#### Security
- [ ] Non-admin users redirected from `/admin/*`
- [ ] Firestore rules prevent unauthorized access
- [ ] Admin-only actions logged to `systemLogs`

#### Performance
- [ ] Pages load with Suspense boundaries
- [ ] Charts/tables lazy-loaded
- [ ] No console errors in production

### 7. Monitoring

- Enable Vercel Analytics for route tracking
- Monitor Firebase usage (reads/writes)
- Set up error tracking (Sentry, etc.)
- Review `systemLogs` collection regularly

## 🔒 Security Notes

- Admin access is gated by:
  1. `NEXT_PUBLIC_ADMIN_EMAIL` environment variable
  2. `users/{uid}.role === "admin"` in Firestore
- Firestore rules enforce admin-only access to sensitive collections
- All admin actions are logged to `systemLogs`

## 📊 Performance Optimization

- Code splitting: Heavy components (charts, tables) are dynamically imported
- Suspense boundaries: Loading states for async data
- Memoization: Heavy computations cached with `useMemo`
- Real-time listeners: Efficient Firestore `onSnapshot` usage

## 🐛 Troubleshooting

### Admin access denied
- Check `NEXT_PUBLIC_ADMIN_EMAIL` matches your email
- Verify `users/{uid}.role === "admin"` in Firestore
- Clear browser cache and cookies

### Firestore permission errors
- Verify rules are deployed: `firebase deploy --only firestore:rules`
- Check indexes are created for complex queries
- Review Firestore Console for specific error messages

### Build failures
- Check all environment variables are set
- Verify Firebase config is correct
- Review build logs in Vercel Dashboard

## 📝 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
