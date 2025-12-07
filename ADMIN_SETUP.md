# Admin Panel Setup Guide

## 1. Environment Variable

Create or update `.env.local` in the project root with your admin email:

```bash
NEXT_PUBLIC_ADMIN_EMAIL=your-admin-email@domain.com
```

**Important:** 
- Replace `your-admin-email@domain.com` with the actual email address you want to use as admin
- This email must match the email used to sign in to Firebase Auth
- After adding this, restart your Next.js dev server

## 2. Firestore Rules

The `firestore.rules` file has been temporarily relaxed for testing. **After confirming admin access works, you should re-tighten the rules.**

### Current (Temporary) Rules:
- Allows any authenticated user to read/write all documents
- This is for debugging and testing only

### To Re-tighten Rules Later:
Restore the original rules that check for admin role and user ownership.

## 3. Firestore Collections

Ensure you have the following collections in Firestore:

### `users/{uid}`
Each user document should have:
- `email` (string)
- `name` (string, optional)
- `role` (string: "user" or "admin")
- `planStatus` (string: "Pending", "In Progress", "Delivered", or null)
- `createdAt` (timestamp or ISO string)

**To make a user an admin:**
1. Go to Firestore Console
2. Navigate to `users/{uid}`
3. Add or update the `role` field to `"admin"`

### `payments/{autoId}`
Each payment document should have:
- `amount` (number)
- `userId` (string, optional)
- `createdAt` (timestamp, optional)

## 4. Testing

1. **Sign in** with the email specified in `NEXT_PUBLIC_ADMIN_EMAIL`
2. **Navigate** to `/admin`
3. **Check console** for logs:
   - `[admin/bootstrap] Created missing users doc` - User doc was created
   - `[admin/bootstrap] Upgraded role to admin` - Role was upgraded
   - `[admin] users snapshot: X` - Users loaded successfully
   - `[admin] payments snapshot: X` - Payments loaded successfully

## 5. Troubleshooting

### Admin page shows "Access Denied"
- Verify `NEXT_PUBLIC_ADMIN_EMAIL` matches your login email exactly
- Check browser console for errors
- Verify Firestore rules are deployed
- Check that your user document has `role: "admin"` in Firestore

### No users/payments showing
- Verify collections exist in Firestore
- Check browser console for Firestore errors
- Verify Firestore rules allow reads for authenticated users
- Use the "Click to log data" button in the admin panel to see what data is loaded

### Data not updating in real-time
- Check browser console for `onSnapshot` errors
- Verify Firestore listeners are not being blocked
- Check network tab for Firestore WebSocket connections

## 6. Deploying Rules

After testing, deploy the updated rules:

```bash
firebase deploy --only firestore:rules
```

Or use the Firebase Console to update rules manually.

