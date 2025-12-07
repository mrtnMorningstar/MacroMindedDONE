# Manual Index Setup for Plans Collection

## Step-by-Step Instructions

### 1. Go to Firebase Console
- Open [Firebase Console](https://console.firebase.google.com/)
- Select your project: **macromindeddone**

### 2. Navigate to Firestore Indexes
- Click on **Firestore Database** in the left sidebar
- Click on the **Indexes** tab (at the top)

### 3. Create New Index
- Click the **Create Index** button

### 4. Configure the Index
Fill in the following:

**Collection ID:** `plans`

**Fields to index:**
1. First field:
   - **Field path:** `userId`
   - **Order:** `Ascending` (↑)
   
2. Second field:
   - **Field path:** `createdAt`
   - **Order:** `Descending` (↓)

**Query scope:** `Collection` (default)

### 5. Create the Index
- Click **Create** button
- You'll see a confirmation that the index is being created

### 6. Wait for Index to Build
- The index status will show as "Building" initially
- This usually takes 1-5 minutes
- Once ready, the status will change to "Enabled"

### 7. Verify
- Refresh your app
- The error should be gone once the index is enabled

## What This Index Does

This composite index allows Firestore to efficiently query:
- All plans for a specific user (`userId`)
- Sorted by creation date, newest first (`createdAt` descending)

## Troubleshooting

- **Can't find the Indexes tab?** Make sure you're in Firestore Database, not Realtime Database
- **Index taking too long?** Large collections can take longer. Check back in 5-10 minutes
- **Still getting errors?** Make sure the index status shows "Enabled" (not "Building")

