# Firestore Indexes Setup

This document explains how to set up the required Firestore indexes for the MacroMinded application.

## Required Indexes

The application requires composite indexes for the following queries:

### 1. Payments Collection

**Index 1:** `payments` collection
- Field: `userId` (Ascending)
- Field: `timestamp` (Descending)

**Index 2:** `payments` collection (if using createdAt)
- Field: `userId` (Ascending)
- Field: `createdAt` (Descending)

### 2. Messages Collection

**Index 1:** `messages` collection (ascending order)
- Field: `userId` (Ascending)
- Field: `timestamp` (Ascending)

**Index 2:** `messages` collection (descending order)
- Field: `userId` (Ascending)
- Field: `timestamp` (Descending)

## Setup Methods

### Method 1: Automatic Setup (Recommended)

1. Deploy the indexes using Firebase CLI:
   ```bash
   firebase deploy --only firestore:indexes
   ```

2. Or use the `firestore.indexes.json` file in the project root.

### Method 2: Manual Setup via Firebase Console

1. When you see an error in the console with a URL like:
   ```
   https://console.firebase.google.com/v1/r/project/macromindeddone/firestore/indexes?create_composite=...
   ```

2. Click the URL to automatically create the index in Firebase Console.

3. Wait for the index to build (usually takes a few minutes).

### Method 3: Create Indexes Manually

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `macromindeddone`
3. Navigate to **Firestore Database** → **Indexes** tab
4. Click **Create Index**
5. For each index:
   - Select the collection name
   - Add fields in order:
     - `userId` (Ascending)
     - `timestamp` or `createdAt` (Ascending or Descending as needed)
   - Click **Create**

## Index Status

After creating indexes, they will show as "Building" initially. Once they're ready, the status will change to "Enabled". This usually takes 1-5 minutes.

## Troubleshooting

- **Index still building?** Wait a few minutes and refresh the page.
- **Still getting errors?** Check that all required indexes are created and enabled.
- **Different field names?** Make sure your Firestore documents use `timestamp` (not `createdAt`) for consistency.

## Note

The application includes fallback error handling that will attempt to fetch data without ordering if indexes are not available, but this is not recommended for production use.

