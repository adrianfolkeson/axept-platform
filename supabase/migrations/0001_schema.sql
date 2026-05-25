-- Axept — base schema
-- Run order: 0001_schema → 0002_rls → 0003_storage

create extension if not exists pgcrypto;

-- ============================================================
-- ENUMS
-- ============================================================
create type user_role as enum ('admin', 'company', 'worker', 'equipment_owner');
create type request_status as enum ('pending', 'accepted', 'declined', 'cancelled', 'completed');
create type equipment_category as enum (
  'excavator', 'loader', 'crane', 'scaffolding', 'generator', 'truck', 'tool', 'other'
);
create type listing_status as enum ('active', 'paused', 'archived');

-- ============================================================
-- PROFILES (1:1 with auth.users)
-- ============================================================
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        user_role not null,
  full_name   text not null,
  phone       text,
  avatar_url  text,
  bio         text,
  city        text,
  region      text,
  verified    boolean not null default false,
  banned      boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index profiles_role_idx on profiles (role) where banned = false;

-- Auto-create profile shell from auth.users.
-- NOTE: full_name + role come from signup metadata. If absent, profile creation
-- is deferred to onboarding (we'll prompt in /signup/complete).
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'company'),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Touch trigger for updated_at
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch
  before update on profiles
  for each row execute function touch_updated_at();

-- ============================================================
-- COMPANIES
-- ============================================================
create table companies (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null unique references profiles(id) on delete cascade,
  org_number   text unique,
  name         text not null,
  website      text,
  description  text,
  hq_city      text,
  hq_region    text,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- WORKER PROFILES
-- ============================================================
create table worker_profiles (
  id                uuid primary key default gen_random_uuid(),
  profile_id        uuid not null unique references profiles(id) on delete cascade,
  headline          text not null,
  skills            text[] not null default '{}',
  experience_years  int not null default 0,
  hourly_rate_sek   int,
  available         boolean not null default true,
  available_from    date,
  travel_radius_km  int,
  created_at        timestamptz not null default now()
);
create index worker_profiles_available_idx on worker_profiles (available);
create index worker_profiles_skills_idx on worker_profiles using gin (skills);

create table certifications (
  id                 uuid primary key default gen_random_uuid(),
  worker_profile_id  uuid not null references worker_profiles(id) on delete cascade,
  title              text not null,
  issuer             text,
  issued_at          date,
  expires_at         date,
  file_url           text,
  verified           boolean not null default false,
  created_at         timestamptz not null default now()
);
create index certifications_worker_idx on certifications (worker_profile_id);

-- ============================================================
-- EQUIPMENT
-- ============================================================
create table equipment (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references profiles(id) on delete cascade,
  title            text not null,
  category         equipment_category not null,
  description      text,
  daily_rate_sek   int not null check (daily_rate_sek >= 0),
  weekly_rate_sek  int check (weekly_rate_sek is null or weekly_rate_sek >= 0),
  city             text,
  region           text,
  status           listing_status not null default 'active',
  created_at       timestamptz not null default now()
);
create index equipment_filter_idx on equipment (status, region, category);
create index equipment_owner_idx on equipment (owner_id);

create table equipment_images (
  id            uuid primary key default gen_random_uuid(),
  equipment_id  uuid not null references equipment(id) on delete cascade,
  url           text not null,
  sort_order    int not null default 0
);
create index equipment_images_equipment_idx on equipment_images (equipment_id, sort_order);

-- ============================================================
-- BOOKING REQUESTS (polymorphic: worker OR equipment)
-- ============================================================
create table booking_requests (
  id                  uuid primary key default gen_random_uuid(),
  requester_id        uuid not null references profiles(id) on delete cascade,
  worker_profile_id   uuid references worker_profiles(id) on delete cascade,
  equipment_id        uuid references equipment(id) on delete cascade,
  start_date          date not null,
  end_date            date not null,
  message             text,
  status              request_status not null default 'pending',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint exactly_one_target check (
    (worker_profile_id is not null)::int + (equipment_id is not null)::int = 1
  ),
  constraint valid_dates check (end_date >= start_date)
);
create index booking_requests_requester_idx on booking_requests (requester_id, status);
create index booking_requests_worker_idx on booking_requests (worker_profile_id)
  where worker_profile_id is not null;
create index booking_requests_equipment_idx on booking_requests (equipment_id)
  where equipment_id is not null;

create trigger booking_requests_touch
  before update on booking_requests
  for each row execute function touch_updated_at();

-- ============================================================
-- CONVERSATIONS + MESSAGES
-- ============================================================
create table conversations (
  id                uuid primary key default gen_random_uuid(),
  request_id        uuid unique references booking_requests(id) on delete set null,
  participant_a     uuid not null references profiles(id) on delete cascade,
  participant_b     uuid not null references profiles(id) on delete cascade,
  last_message_at   timestamptz,
  created_at        timestamptz not null default now(),
  constraint distinct_participants check (participant_a <> participant_b)
);
create index conversations_a_idx on conversations (participant_a, last_message_at desc);
create index conversations_b_idx on conversations (participant_b, last_message_at desc);

create table messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references conversations(id) on delete cascade,
  sender_id        uuid not null references profiles(id) on delete cascade,
  body             text not null check (length(body) between 1 and 5000),
  read_at          timestamptz,
  created_at       timestamptz not null default now()
);
create index messages_conversation_idx on messages (conversation_id, created_at desc);

-- bump conversations.last_message_at on insert
create or replace function bump_conversation_last_message()
returns trigger language plpgsql as $$
begin
  update conversations
    set last_message_at = new.created_at
    where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_bump_conversation
  after insert on messages
  for each row execute function bump_conversation_last_message();

-- ============================================================
-- REVIEWS (polymorphic: worker OR equipment)
-- ============================================================
create table reviews (
  id                  uuid primary key default gen_random_uuid(),
  author_id           uuid not null references profiles(id) on delete cascade,
  request_id          uuid not null references booking_requests(id) on delete cascade,
  worker_profile_id   uuid references worker_profiles(id) on delete cascade,
  equipment_id        uuid references equipment(id) on delete cascade,
  rating              int not null check (rating between 1 and 5),
  body                text,
  created_at          timestamptz not null default now(),
  constraint exactly_one_subject check (
    (worker_profile_id is not null)::int + (equipment_id is not null)::int = 1
  ),
  unique (author_id, request_id)
);
create index reviews_worker_idx on reviews (worker_profile_id) where worker_profile_id is not null;
create index reviews_equipment_idx on reviews (equipment_id) where equipment_id is not null;

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table notifications (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references profiles(id) on delete cascade,
  type         text not null,
  payload      jsonb not null default '{}'::jsonb,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);
create index notifications_profile_idx on notifications (profile_id, read_at, created_at desc);
