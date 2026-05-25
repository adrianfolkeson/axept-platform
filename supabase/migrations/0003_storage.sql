-- Axept — Storage buckets + policies

insert into storage.buckets (id, name, public)
values
  ('avatars',           'avatars',           true),
  ('equipment-images',  'equipment-images',  true),
  ('certifications',    'certifications',    false)
on conflict (id) do nothing;

-- ============================================================
-- avatars: public read, owner-only write. Path: {profile_id}/...
-- ============================================================
create policy avatars_public_read on storage.objects
  for select using (bucket_id = 'avatars');

create policy avatars_owner_write on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy avatars_owner_update on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy avatars_owner_delete on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- equipment-images: public read, owner-only write. Path: {equipment_id}/...
-- ============================================================
create policy equipment_images_public_read on storage.objects
  for select using (bucket_id = 'equipment-images');

create policy equipment_images_owner_write on storage.objects
  for insert with check (
    bucket_id = 'equipment-images'
    and exists (
      select 1 from public.equipment e
      where e.id::text = (storage.foldername(name))[1]
        and e.owner_id = auth.uid()
    )
  );

create policy equipment_images_owner_update on storage.objects
  for update using (
    bucket_id = 'equipment-images'
    and exists (
      select 1 from public.equipment e
      where e.id::text = (storage.foldername(name))[1]
        and e.owner_id = auth.uid()
    )
  );

create policy equipment_images_owner_delete on storage.objects
  for delete using (
    bucket_id = 'equipment-images'
    and exists (
      select 1 from public.equipment e
      where e.id::text = (storage.foldername(name))[1]
        and e.owner_id = auth.uid()
    )
  );

-- ============================================================
-- certifications: private. Path: {worker_profile_id}/...
-- Read/write only for the owning worker. Admin via service role.
-- ============================================================
create policy certifications_owner_read on storage.objects
  for select using (
    bucket_id = 'certifications'
    and exists (
      select 1 from public.worker_profiles wp
      where wp.id::text = (storage.foldername(name))[1]
        and wp.profile_id = auth.uid()
    )
  );

create policy certifications_owner_write on storage.objects
  for insert with check (
    bucket_id = 'certifications'
    and exists (
      select 1 from public.worker_profiles wp
      where wp.id::text = (storage.foldername(name))[1]
        and wp.profile_id = auth.uid()
    )
  );

create policy certifications_owner_update on storage.objects
  for update using (
    bucket_id = 'certifications'
    and exists (
      select 1 from public.worker_profiles wp
      where wp.id::text = (storage.foldername(name))[1]
        and wp.profile_id = auth.uid()
    )
  );

create policy certifications_owner_delete on storage.objects
  for delete using (
    bucket_id = 'certifications'
    and exists (
      select 1 from public.worker_profiles wp
      where wp.id::text = (storage.foldername(name))[1]
        and wp.profile_id = auth.uid()
    )
  );
