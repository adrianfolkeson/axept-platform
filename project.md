# AXEPT — PROJECT OVERVIEW

## Overview

Axept is a modern construction marketplace platform built for the Nordic construction industry.

The platform connects:
- Construction companies
- Workers / contractors
- Equipment owners

The purpose of the platform is to modernize how construction resources are discovered, booked, and managed.

This is NOT an ERP system.

The first version is ONLY a focused MVP marketplace platform.

---

# MVP GOAL

The MVP allows:

- Companies to find workers and equipment
- Workers to showcase skills and availability
- Equipment owners to rent out machinery
- Users to communicate through booking requests and messaging

The MVP focuses on:
- simplicity
- trust
- speed
- mobile-first UX
- scalable architecture

---

# USER TYPES

## 1. Admin
Platform administrators.

Permissions:
- Verify users
- Moderate listings
- Remove users/listings
- Access admin dashboard

---

## 2. Construction Company

Permissions:
- Create company profile
- Browse workers
- Browse equipment
- Send booking requests
- Message users
- Leave reviews

---

## 3. Worker / Contractor

Permissions:
- Create worker profile
- Add certifications
- Set availability
- Receive booking requests
- Accept/reject requests
- Message users

---

## 4. Equipment Owner

Permissions:
- Create equipment listings
- Upload images
- Set pricing
- Set availability
- Receive booking requests
- Message users

---

# MVP FEATURES

## Authentication
- Register
- Login
- Password reset
- Protected routes
- Role-based access

---

## Profiles
### Company profiles
- Company information
- Description
- Location
- Certifications
- Reviews

### Worker profiles
- Skills
- Experience
- Availability
- Hourly rate
- Certifications

### Equipment profiles
- Images
- Pricing
- Category
- Availability
- Description
- Location

---

## Marketplace
- Browse workers
- Browse equipment
- Search
- Filtering
- Categories
- Listing detail pages

---

## Booking Requests
Users can:
- Send requests
- Accept/reject requests
- Track booking status

---

## Messaging
- Real-time chat
- Conversation system
- Notifications

---

## Reviews
- Ratings
- Written reviews
- Trust system

---

## Admin Moderation
- User moderation
- Listing moderation
- Verification handling

---

# NOT INCLUDED IN MVP

The following features are NOT part of the MVP:

- AI systems
- Invoicing
- Payroll
- ERP functionality
- Project management
- Subscription billing
- Payment processing
- Escrow
- Fleet tracking
- Mobile applications
- Advanced analytics
- Multi-language support

---

# TECH STACK

## Frontend
- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui

---

## Backend
- Supabase
- PostgreSQL

---

## Authentication
- Supabase Auth

---

## Storage
- Supabase Storage

---

## Hosting
- Vercel

---

# ARCHITECTURE PRINCIPLES

The platform must be:
- Modular
- Scalable
- Mobile-first
- Secure
- Maintainable
- Production-ready

The codebase should:
- Use reusable components
- Use feature-based architecture
- Avoid duplication
- Follow clean TypeScript practices
- Use server actions when appropriate
- Use proper validation
- Be easy to extend later

---

# CORE USER FLOW

## Company Flow
1. Register account
2. Create company profile
3. Browse marketplace
4. Filter workers/equipment
5. Open listing
6. Send request
7. Chat with user
8. Accept booking

---

## Worker Flow
1. Register account
2. Create worker profile
3. Upload certifications
4. Set availability
5. Receive requests
6. Accept/reject requests

---

## Equipment Owner Flow
1. Register account
2. Create equipment listing
3. Upload images
4. Set pricing/location
5. Receive requests
6. Accept booking

---

# DATABASE ENTITIES

Core entities include:

- users
- companies
- worker_profiles
- certifications
- equipment
- equipment_images
- booking_requests
- conversations
- messages
- reviews
- notifications

---

# ROUTE STRUCTURE

## Public Routes
/
- /login
- /register
- /marketplace
- /workers
- /equipment
- /listing/[id]

---

## Dashboard Routes
- /dashboard
- /dashboard/profile
- /dashboard/equipment
- /dashboard/bookings
- /dashboard/messages
- /dashboard/settings

---

## Admin Routes
- /admin
- /admin/users
- /admin/listings
- /admin/reviews

---

# DEVELOPMENT PRIORITIES

## Phase 1
Foundation
- Next.js setup
- Supabase setup
- Authentication
- Database schema
- Dashboard shell

---

## Phase 2
Marketplace
- Profiles
- Listings
- Search/filtering
- Listing pages

---

## Phase 3
Interactions
- Booking requests
- Messaging
- Notifications
- Reviews

---

## Phase 4
Polish
- Responsive improvements
- Security
- Optimization
- Deployment
- QA testing

---

# IMPORTANT DEVELOPMENT RULES

- Do NOT overengineer
- Do NOT introduce unnecessary abstractions
- Keep the MVP focused
- Prioritize clean UX
- Prioritize maintainability
- Build modular reusable systems
- Mobile-first always
- Security first
- Avoid premature optimization

---

# PROJECT GOAL

The goal is to build a focused, scalable construction marketplace MVP that can later evolve into a larger platform ecosystem.