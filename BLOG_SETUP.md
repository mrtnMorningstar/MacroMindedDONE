# Blog Setup Guide

## Firebase Blog Collection Structure

Blog posts are stored in the `blog` collection in Firestore. Each document should have the following structure:

```javascript
{
  slug: "getting-started-with-macros",        // URL-friendly identifier
  title: "Getting Started with Macros",        // Article title
  description: "Learn the basics...",           // Short description
  content: "<p>Full HTML content...</p>",       // Full article content (HTML)
  thumbnail: "https://example.com/image.jpg",  // Optional: Image URL
  date: "2024-01-15T00:00:00.000Z",            // ISO date string
  category: "nutrition",                        // Optional: Category for filtering
  author: "MacroMinded Team",                   // Optional: Author name
  published: true                               // Set to false to hide from public
}
```

## Adding Blog Posts via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database**
4. Click **Start collection** (if `blog` doesn't exist)
5. Collection ID: `blog`
6. Add documents with the fields above

## Example Blog Post

```javascript
{
  slug: "meal-prep-tips",
  title: "5 Meal Prep Tips for Success",
  description: "Simple strategies to make meal prep easier and more sustainable.",
  content: `
    <h2>Introduction</h2>
    <p>Meal prep is one of the most effective strategies for sticking to your nutrition plan.</p>
    <h2>Tips</h2>
    <ol>
      <li>Start small - prep just a few meals at first</li>
      <li>Invest in quality containers</li>
      <li>Prep on the same day each week</li>
      <li>Keep it simple - don't overcomplicate recipes</li>
      <li>Prep ingredients, not just complete meals</li>
    </ol>
  `,
  thumbnail: "https://images.unsplash.com/photo-...",
  date: "2024-01-10T00:00:00.000Z",
  category: "tips",
  author: "MacroMinded Team",
  published: true
}
```

## Categories

Common categories you can use:
- `nutrition` - Nutrition advice
- `tips` - Tips and tricks
- `recipes` - Recipe articles
- `workout` - Workout-related content
- `general` - General articles

## Features

- ✅ **Search**: Search by title, description, or content
- ✅ **Filter**: Filter by category
- ✅ **SEO Optimized**: Dark background, large white text, red links
- ✅ **Responsive**: Works on all devices
- ✅ **Smooth Animations**: Framer Motion transitions
- ✅ **Dynamic Routes**: `/blog/[slug]` for individual posts

## Security Rules

The blog collection is publicly readable (for SEO) but only admins can write:

```javascript
match /blog/{postId} {
  allow read: if true;  // Public read for SEO
  allow write: if isAdmin();  // Only admins can create/edit
}
```

