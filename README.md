# Axept

Mobile-first construction marketplace for the Nordic market. Connects construction companies, workers/contractors, and equipment owners.

> Status: MVP. Feature-complete across 10 build phases. Not a payments / ERP / scheduling platform.

---

## Stack

- **Next.js 15** App Router · React 19 · TypeScript (strict)
- **Tailwind CSS** with shadcn-style primitives
- **Supabase** — Postgres, Auth, Storage, Realtime
- **Vercel** — hosting + edge runtime

---

## Architecture

Feature-based, scalable, RSC-first. Server Actions for every mutation. RLS on every table — trust the database.

```
src/
  app/                          # routes (RSC by default)
    (marketing)/                #   public landing
    (auth)/                     #   signup / login / oauth callback
    (app)/                      #   authed shell w/ TopBar + Sidebar/MobileNav
      dashboard/
      marketplace/
      requests/
      messages/
      profile/
      admin/
  features/                     # feature modules
    auth/ profiles/ companies/ workers/ equipment/
    certifications/ requests/ messages/ reviews/ admin/
    └── each: schemas.ts (zod) · queries.ts · actions.ts · components/
  components/
    ui/                         # Button, Input, Textarea, Label, Section, Stars
    forms/                      # FormField
    layout/                     # TopBar, Sidebar, MobileNav
    marketplace/                # FilterBar, WorkerCard, EquipmentCard, EmptyState
  lib/
    supabase/                   # server / client / admin / middleware
    auth/                       # requireUser / requireRole
    utils/                      # cn, format (sv-SE)
    env.ts
  middleware.ts                 # refreshes Supabase session
supabase/
  migrations/
    0001_schema.sql             # 11 tables + enums + triggers
    0002_rls.sql                # RLS on every table, admin override via is_admin()
    0003_storage.sql            # avatars (public), equipment-images (public), certifications (private)
```

### Feature module contract

Every `features/*` module exposes:

- `schemas.ts` — Zod schemas (single source of truth → derived TS types)
- `queries.ts` — server-only read functions called from RSC
- `actions.ts` — `"use server"` mutations; the **only** mutation entry points
- `components/` — feature-owned UI

Routes are thin: render + call `queries`. Mutations always via `actions`. No ad-hoc Supabase calls inside `app/`.

---

## Security model

- **RLS-first.** Every table denies by default; explicit policies open doors. Admin overrides via `is_admin()` helper.
- **Server Actions verify role + ownership** before every write — defense in depth on top of RLS.
- **Service-role client is server-only.** Used only inside `/admin` paths after `requireRole('admin')`.
- **Storage paths are RLS-scoped.** Avatars: `{user_id}/...`. Equipment images: `{equipment_id}/...`. Certifications: `{worker_profile_id}/...` (private, signed URLs).
- **No client-side bypass.** Browser uploads go straight to Storage with anon key; RLS validates path ownership.

---

## Core entities

| Table | Purpose |
|---|---|
| `profiles` | 1:1 with `auth.users`. Role-locked. Admin-toggled `verified` / `banned` flags. |
| `companies` | Org info, 1:1 with profile (role=company) |
| `worker_profiles` | Headline, skills, hourly rate, availability |
| `certifications` | Worker proofs, admin-verified |
| `equipment` | Listings owned by `equipment_owner` profiles |
| `equipment_images` | Polymorphic-free FK to equipment |
| `booking_requests` | XOR polymorphic target (worker OR equipment) + 5-state machine |
| `conversations` | 1:1 thread, auto-created on request accept |
| `messages` | Body + read_at, scoped realtime per conversation |
| `reviews` | XOR polymorphic subject (worker OR equipment), 1 per (author, request) |
| `notifications` | Per-profile, JSONB payload |

Booking state machine — `src/features/requests/state-machine.ts`:

```
pending  → accepted  (target)
         → declined  (target)
         → cancelled (requester)
accepted → completed (requester | target)
         → cancelled (requester)
```

---

## Local development

### 1. Install

```bash
npm install
```

### 2. Supabase project

Create a project at supabase.com, then in the SQL editor run the migrations in order:

```
supabase/migrations/0001_schema.sql
supabase/migrations/0002_rls.sql
supabase/migrations/0003_storage.sql
```

Enable email/password auth (Auth → Providers).

Enable **realtime replication** for the `messages` table (Database → Replication).

### 3. Env

Copy `.env.example` to `.env.local` and fill:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Make your first admin

After signing up once:

```sql
update profiles set role = 'admin' where id = '<your-auth-user-id>';
```

### 5. Run

```bash
npm run dev
```

---

## Mobile-first

Target devices: 320 / 375 / 390 / 430 px wide. Desktop is secondary.

- All form inputs use 16px minimum on mobile to suppress iOS Safari auto-zoom.
- All interactive elements ≥ 44×44 px.
- Bottom nav for thumb-zone navigation; sidebar shown only at `md+`.
- `100dvh` (not `100vh`) for viewport-bound surfaces.
- `active:` states everywhere — no hover-dependent UX.
- Equipment owner table → responsive cards below `md`.
- Filter bars stack vertically on phone.

---

## Production checklist

- Migrations applied to Supabase project
- Email/password auth enabled
- Realtime replication enabled for `messages`
- Env vars set in Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`)
- First admin promoted via SQL
- Auth redirect URL added in Supabase: `<app-url>/callback`

---

## Scripts

```bash
npm run dev         # next dev
npm run build       # next build
npm run start       # next start
npm run typecheck   # tsc --noEmit
```

---

## Out of scope (intentional)

No payments. No invoicing. No scheduling engine. No calendar. No AI features. No notification infra (push/email). No mobile app. No analytics. No support tickets. No CRM. No reputation algorithms. No fleet tracking. No project management.

When MVP validates, swap in dedicated systems (Stripe, Resend, etc.) at clear seams.
