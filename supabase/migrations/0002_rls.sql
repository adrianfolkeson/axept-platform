-- Axept — Row Level Security
-- Trust the DB. Every table denies by default, then opens explicit doors.

-- Helper: is the current user an admin?
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- profiles
-- ============================================================
alter table profiles enable row level security;

create policy profiles_select_public on profiles
  for select using (banned = false or is_admin());

create policy profiles_update_self on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy profiles_admin_all on profiles
  for all using (is_admin()) with check (is_admin());

-- ============================================================
-- companies
-- ============================================================
alter table companies enable row level security;

create policy companies_select_public on companies
  for select using (true);

create policy companies_insert_self on companies
  for insert with check (owner_id = auth.uid());

create policy companies_update_self on companies
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy companies_delete_self on companies
  for delete using (owner_id = auth.uid() or is_admin());

-- ============================================================
-- worker_profiles
-- ============================================================
alter table worker_profiles enable row level security;

create policy worker_profiles_select_public on worker_profiles
  for select using (
    exists (select 1 from profiles p where p.id = worker_profiles.profile_id and p.banned = false)
    or is_admin()
  );

create policy worker_profiles_insert_self on worker_profiles
  for insert with check (profile_id = auth.uid());

create policy worker_profiles_update_self on worker_profiles
  for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy worker_profiles_delete_self on worker_profiles
  for delete using (profile_id = auth.uid() or is_admin());

-- ============================================================
-- certifications (sensitive — owner + admin only)
-- ============================================================
alter table certifications enable row level security;

create policy certifications_select_owner on certifications
  for select using (
    exists (
      select 1 from worker_profiles wp
      where wp.id = certifications.worker_profile_id and wp.profile_id = auth.uid()
    )
    or is_admin()
  );

create policy certifications_write_owner on certifications
  for all using (
    exists (
      select 1 from worker_profiles wp
      where wp.id = certifications.worker_profile_id and wp.profile_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from worker_profiles wp
      where wp.id = certifications.worker_profile_id and wp.profile_id = auth.uid()
    )
  );

-- ============================================================
-- equipment
-- ============================================================
alter table equipment enable row level security;

create policy equipment_select_public on equipment
  for select using (
    status = 'active'
    or owner_id = auth.uid()
    or is_admin()
  );

create policy equipment_insert_self on equipment
  for insert with check (owner_id = auth.uid());

create policy equipment_update_self on equipment
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy equipment_delete_self on equipment
  for delete using (owner_id = auth.uid() or is_admin());

-- ============================================================
-- equipment_images
-- ============================================================
alter table equipment_images enable row level security;

create policy equipment_images_select_public on equipment_images
  for select using (
    exists (
      select 1 from equipment e
      where e.id = equipment_images.equipment_id
        and (e.status = 'active' or e.owner_id = auth.uid() or is_admin())
    )
  );

create policy equipment_images_write_owner on equipment_images
  for all using (
    exists (
      select 1 from equipment e
      where e.id = equipment_images.equipment_id and e.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from equipment e
      where e.id = equipment_images.equipment_id and e.owner_id = auth.uid()
    )
  );

-- ============================================================
-- booking_requests
-- ============================================================
alter table booking_requests enable row level security;

-- Is the current user the target owner?
create or replace function is_request_target(req booking_requests)
returns boolean
language sql
stable
as $$
  select
    case
      when req.worker_profile_id is not null then exists (
        select 1 from worker_profiles wp
        where wp.id = req.worker_profile_id and wp.profile_id = auth.uid()
      )
      when req.equipment_id is not null then exists (
        select 1 from equipment e
        where e.id = req.equipment_id and e.owner_id = auth.uid()
      )
      else false
    end;
$$;

create policy booking_requests_select_parties on booking_requests
  for select using (
    requester_id = auth.uid()
    or is_request_target(booking_requests)
    or is_admin()
  );

create policy booking_requests_insert_self on booking_requests
  for insert with check (requester_id = auth.uid());

-- Update allowed by requester (cancel) or target (accept/decline/complete).
create policy booking_requests_update_parties on booking_requests
  for update using (
    requester_id = auth.uid() or is_request_target(booking_requests) or is_admin()
  ) with check (
    requester_id = auth.uid() or is_request_target(booking_requests) or is_admin()
  );

-- ============================================================
-- conversations + messages
-- ============================================================
alter table conversations enable row level security;

create policy conversations_select_participants on conversations
  for select using (
    participant_a = auth.uid() or participant_b = auth.uid() or is_admin()
  );

create policy conversations_insert_participants on conversations
  for insert with check (
    participant_a = auth.uid() or participant_b = auth.uid()
  );

create policy conversations_update_participants on conversations
  for update using (
    participant_a = auth.uid() or participant_b = auth.uid()
  ) with check (
    participant_a = auth.uid() or participant_b = auth.uid()
  );

alter table messages enable row level security;

create policy messages_select_participants on messages
  for select using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
    or is_admin()
  );

create policy messages_insert_sender on messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );

-- Mark-as-read updates only.
create policy messages_update_recipient on messages
  for update using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  ) with check (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );

-- ============================================================
-- reviews
-- ============================================================
alter table reviews enable row level security;

create policy reviews_select_public on reviews
  for select using (true);

-- Only the requester of a completed booking can review.
create policy reviews_insert_after_completion on reviews
  for insert with check (
    author_id = auth.uid()
    and exists (
      select 1 from booking_requests b
      where b.id = request_id
        and b.requester_id = auth.uid()
        and b.status = 'completed'
    )
  );

create policy reviews_update_author on reviews
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());

create policy reviews_delete_author_or_admin on reviews
  for delete using (author_id = auth.uid() or is_admin());

-- ============================================================
-- notifications
-- ============================================================
alter table notifications enable row level security;

create policy notifications_self on notifications
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
