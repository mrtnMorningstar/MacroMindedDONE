# Create Plans Collection Index

## Quick Fix

You're seeing this error because the `plans` collection needs a composite index. Here's how to fix it:

## Method 1: Click the Error URL (Easiest)

1. **Copy the URL from the error message:**
   ```
   https://console.firebase.google.com/v1/r/project/macromindeddone/firestore/indexes?create_composite=Ck1wcm9qZWN0cy9tYWNyb21pbmRlZGRvbmUvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3BsYW5zL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI
   ```

2. **Paste it in your browser** and press Enter

3. **Click "Create Index"** in the Firebase Console

4. **Wait 1-5 minutes** for the index to build

5. **Refresh your app** - the error should be gone!

## Method 2: Deploy via Firebase CLI

If you have Firebase CLI installed:

```bash
firebase deploy --only firestore:indexes
```

This will deploy all indexes from `firestore.indexes.json`.

## Method 3: Manual Creation

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **macromindeddone**
3. Navigate to **Firestore Database** → **Indexes** tab
4. Click **Create Index**
5. Configure:
   - **Collection ID:** `plans`
   - **Fields:**
     - `userId` → **Ascending**
     - `createdAt` → **Descending**
   - **Query scope:** Collection
6. Click **Create**
7. Wait for the index to build (status will show "Building" then "Enabled")

## What This Index Does

This index allows efficient queries to:
- Find all plans for a specific user (`userId`)
- Sort them by creation date (`createdAt`) in descending order (newest first)

## Temporary Workaround

The app includes a fallback that will work without the index, but it's slower and not recommended for production. The error will still appear in the console, but the app should function.

## After Creating the Index

Once the index is created and enabled:
- ✅ The error will disappear
- ✅ Queries will be faster
- ✅ The app will work optimally

**Note:** Index creation usually takes 1-5 minutes. You can check the status in Firebase Console → Firestore → Indexes.

