# Responsive Design Guide

## Breakpoints

The application uses Tailwind CSS breakpoints for responsive design:

- **sm**: 640px (small tablets)
- **md**: 768px (tablets)
- **lg**: 1024px (laptops)
- **xl**: 1280px (desktops)
- **2xl**: 1536px (large desktops)

## Responsive Features

### Navigation
- Mobile: Hamburger menu with slide-in drawer
- Desktop: Horizontal navigation bar
- Breakpoint: `md:` (768px)

### Typography
- Mobile: Smaller headings (text-4xl, text-5xl)
- Desktop: Larger headings (text-5xl, text-6xl)
- Breakpoints: `md:`, `lg:`

### Grid Layouts
- Mobile: Single column (`grid-cols-1`)
- Tablet: Two columns (`md:grid-cols-2`)
- Desktop: Three columns (`lg:grid-cols-3`)
- Used in: Blog listing, Plans page, How It Works section

### Spacing
- Mobile: Reduced padding (`px-4`, `py-12`)
- Desktop: Increased padding (`px-6 lg:px-8`, `py-20`)
- Breakpoints: `sm:`, `lg:`

### Forms
- Mobile: Full width inputs
- Desktop: Max width containers (`max-w-md`, `max-w-lg`)
- Breakpoints: All forms are responsive

### Cards
- Mobile: Full width with reduced padding
- Desktop: Grid layout with hover effects
- Breakpoints: `md:`, `lg:`

## Testing Checklist

### Mobile (320px - 640px)
- [ ] Navigation menu works correctly
- [ ] Text is readable without zooming
- [ ] Buttons are easily tappable (min 44x44px)
- [ ] Forms are usable
- [ ] Images scale properly
- [ ] No horizontal scrolling

### Tablet (640px - 1024px)
- [ ] Two-column layouts work
- [ ] Navigation adapts appropriately
- [ ] Cards display in grid
- [ ] Forms are centered and readable

### Desktop (1024px+)
- [ ] Three-column layouts work
- [ ] Hover effects function
- [ ] Optimal use of screen space
- [ ] Text is not too large

## Components with Responsive Design

1. **Navbar**: Mobile menu, desktop horizontal
2. **Hero Section**: Responsive text sizes, image scaling
3. **Plans Page**: 1/2/3 column grid based on screen size
4. **Blog**: Responsive grid with search/filter
5. **Dashboard**: Responsive cards and tables
6. **Admin Panel**: Responsive tabs and tables
7. **Forms**: All forms are mobile-friendly

## Best Practices Applied

- ✅ Mobile-first approach
- ✅ Flexible grid systems
- ✅ Responsive typography
- ✅ Touch-friendly buttons (min 44x44px)
- ✅ Readable text sizes
- ✅ Optimized images with Next.js Image
- ✅ No horizontal scrolling
- ✅ Accessible navigation

