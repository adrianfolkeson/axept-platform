# axept-platform
# Axept Platform

A modern construction marketplace platform built for the Nordic construction industry.

Axept connects:
- Construction companies
- Workers / contractors
- Equipment owners

The platform enables:
- Worker discovery
- Equipment rentals
- Booking requests
- Real-time messaging
- Reviews & trust systems
- Admin moderation

---

# Tech Stack

## Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui

## Backend
- Supabase
- PostgreSQL

## Authentication
- Supabase Auth

## Storage
- Supabase Storage

## Hosting
- Vercel

---

# MVP Features

## Authentication
- Email/password auth
- Role-based access
- Protected routes
- Session handling

## Profiles
- Company profiles
- Worker profiles
- Equipment owner profiles
- Certifications
- Avatar uploads

## Marketplace
- Workers marketplace
- Equipment marketplace
- Search & filtering
- Detail pages
- Ratings & reviews

## Booking Requests
- Request flow
- Accept / decline / cancel / complete
- Request state machine
- Inbox/outbox

## Messaging
- Real-time 1:1 messaging
- Scoped realtime subscriptions
- Read states
- Conversation threads

## Reviews
- Ratings system
- Verified post-request reviews
- Average rating aggregation

## Admin Moderation
- User moderation
- Listing moderation
- Certification verification
- Review moderation

---

# Architecture Principles

The platform is built with:
- Modular architecture
- Feature-based folder structure
- Server-side security
- RLS-first database design
- Mobile-first UX
- Production-ready patterns

---

# Folder Structure

```txt
src/
 ├── app/
 ├── components/
 ├── features/
 ├── lib/
 ├── hooks/
 ├── types/
 ├── utils/
 └── styles/
```

Feature modules:

```txt
features/
 ├── auth/
 ├── profiles/
 ├── companies/
 ├── workers/
 ├── equipment/
 ├── requests/
 ├── messages/
 ├── reviews/
 └── admin/
```

---

# Security

The platform uses:
- Supabase Row Level Security (RLS)
- Server-side permission validation
- Role-based access control
- Scoped realtime subscriptions
- Signed URLs for private files
- Defense-in-depth validation

---

# Mobile-First Design

The platform is optimized for:
- Construction field workers
- One-handed mobile usage
- Responsive layouts
- Large touch targets
- iOS/Android compatibility

---

# Marketplace Flow

1. User signs up
2. User creates profile
3. User creates listing
4. Marketplace browsing
5. Request sent
6. Request accepted
7. Messaging starts
8. Request completed
9. Review submitted

---

# Request State Machine

```txt
pending
accepted
declined
cancelled
completed
```

---

# Local Development

## Install dependencies

```bash
npm install
```

## Run development server

```bash
npm run dev
```

---

# Environment Variables

Create `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

# Supabase Setup

1. Create Supabase project
2. Run migrations in order:
   - 0001_schema.sql
   - 0002_rls.sql
   - 0003_storage.sql
3. Enable email/password auth
4. Enable replication on `messages` table for realtime

---

# Deployment

## Vercel

```bash
vercel link
vercel --prod
```

---

# Production Notes

Before production:
- Configure environment variables
- Enable production storage policies
- Set first admin account
- Configure backups
- Add monitoring/logging
- Run full QA pass

---

# Admin Setup

Set first admin manually:

```sql
update profiles
set role = 'admin'
where id = '<your-user-id>';
```

---

# MVP Scope

This project intentionally excludes:
- Payments
- Invoicing
- ERP systems
- AI systems
- Scheduling engines
- Fleet tracking
- Mobile apps
- Advanced analytics

The goal is a focused, scalable marketplace MVP.

---

# Future Expansion

Potential future phases:
- Payments
- Escrow
- Advanced availability
- AI matching
- Analytics
- Project management
- Notifications
- Native mobile apps

---

# Status

Current status:
- MVP Complete
- Mobile optimized
- Production-ready architecture
- Pending deployment + QA hardening

---

# License

Private project — all rights reserved.
