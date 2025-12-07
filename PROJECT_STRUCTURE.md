# MacroMinded Project Structure

## Final App Directory Structure

```
app/
├── (public)/                    # Public route group
│   ├── layout.tsx              # Navbar + Footer layout
│   ├── page.tsx                # Home page (/)
│   ├── plans/
│   │   └── page.tsx           # Plans page (/plans)
│   ├── blog/
│   │   ├── page.tsx           # Blog listing (/blog)
│   │   └── [slug]/
│   │       └── page.tsx       # Blog posts (/blog/[slug])
│   ├── contact/
│   │   └── page.tsx           # Contact page (/contact)
│   ├── questionnaire/
│   │   └── page.tsx           # Questionnaire (/questionnaire)
│   ├── checkout/
│   │   └── page.tsx           # Checkout (/checkout)
│   └── auth/
│       ├── login/
│       │   └── page.tsx       # Login (/auth/login)
│       └── signup/
│           └── page.tsx       # Signup (/auth/signup)
│
├── (dashboard)/                # Dashboard route group
│   ├── layout.tsx             # Sidebar + TopBar layout
│   └── dashboard/
│       ├── page.tsx           # Dashboard home (/dashboard)
│       ├── plan/
│       │   └── page.tsx       # My Plan (/dashboard/plan)
│       ├── chat/
│       │   └── page.tsx       # Chat (/dashboard/chat)
│       └── payments/
│           └── page.tsx       # Payments (/dashboard/payments)
│
├── admin/                      # Admin panel (separate layout)
│   ├── layout.tsx
│   └── page.tsx               # Admin (/admin)
│
├── api/                        # API routes
│   ├── checkout/
│   ├── webhook/
│   ├── contact/
│   └── ...
│
├── globals.css
└── layout.tsx                  # Root layout (minimal)
```

## Route Mapping

### Public Routes (Navbar + Footer)
- `/` → Home
- `/plans` → Plans
- `/blog` → Blog listing
- `/blog/[slug]` → Blog posts
- `/contact` → Contact
- `/questionnaire` → Questionnaire
- `/checkout` → Checkout
- `/auth/login` → Login
- `/auth/signup` → Signup

### Dashboard Routes (Sidebar + TopBar)
- `/dashboard` → Dashboard home
- `/dashboard/plan` → My Plan
- `/dashboard/chat` → Chat
- `/dashboard/payments` → Payments

### Admin Routes (Separate layout)
- `/admin` → Admin panel
