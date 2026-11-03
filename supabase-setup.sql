-- АРМАДА: run this script in Supabase Dashboard -> SQL Editor.
-- Then create your admin user in Authentication -> Users.
-- Disable public sign-ups in Authentication -> Settings.
create table if not exists public.site_content (
  id text primary key default 'main',
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security;

drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content"
  on public.site_content for select
  using (true);

drop policy if exists "Authenticated admins can insert site content" on public.site_content;
create policy "Authenticated admins can insert site content"
  on public.site_content for insert to authenticated
  with check (true);

drop policy if exists "Authenticated admins can update site content" on public.site_content;
create policy "Authenticated admins can update site content"
  on public.site_content for update to authenticated
  using (true) with check (true);

insert into public.site_content (id, content)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('armada-images', 'armada-images', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;

drop policy if exists "Public can view Armada images" on storage.objects;
create policy "Public can view Armada images"
  on storage.objects for select
  using (bucket_id = 'armada-images');

drop policy if exists "Authenticated admins can upload Armada images" on storage.objects;
create policy "Authenticated admins can upload Armada images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'armada-images');

drop policy if exists "Authenticated admins can update Armada images" on storage.objects;
create policy "Authenticated admins can update Armada images"
  on storage.objects for update to authenticated
  using (bucket_id = 'armada-images')
  with check (bucket_id = 'armada-images');

drop policy if exists "Authenticated admins can delete Armada images" on storage.objects;
create policy "Authenticated admins can delete Armada images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'armada-images');
