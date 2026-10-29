-- ============================================================
-- IELTSwithKaif — Supabase database setup
-- Run this ONCE in your Supabase project:
--   Dashboard -> SQL Editor -> New query -> paste -> Run
-- Tables: categories, tests, questions, lessons, materials,
--         speaking_topics, settings
-- Security: anyone can READ published content; only a logged-in
-- admin (Supabase Auth user) can add/edit/delete.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('reading','listening','lesson','material')),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.tests (
  id uuid primary key default gen_random_uuid(),
  skill text not null check (skill in ('reading','listening')),
  title text not null,
  category text not null default 'General',
  level text not null default 'All levels',
  time_minutes int not null default 20,
  passage text default '',
  audio_url text default '',
  image_url text default '',
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  position int not null default 0,
  qtype text not null check (qtype in ('mcq','tfng','ynng','fill','match')),
  prompt text not null,
  options jsonb not null default '[]'::jsonb,   -- ["A text","B text",...] for mcq/match
  answer text not null default '',
  explanation text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'lesson' check (kind in ('lesson','material')),
  title text not null,
  category text not null default 'General',
  body text not null default '',
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.writing_tasks (
  id uuid primary key default gen_random_uuid(),
  task_no int not null default 1 check (task_no in (1,2)),
  title text not null,
  prompt text not null default '',
  image_url text default '',
  model_answer text default '',
  tips text default '',
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.speaking_topics (
  id uuid primary key default gen_random_uuid(),
  part int not null default 1 check (part in (1,2,3)),
  title text not null,
  questions jsonb not null default '[]'::jsonb,  -- array of strings; part 2: cue card lines + follow-ups
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  key text primary key,
  value text not null default ''
);

-- ---------- Row Level Security ----------
alter table public.categories enable row level security;
alter table public.tests enable row level security;
alter table public.questions enable row level security;
alter table public.lessons enable row level security;
alter table public.writing_tasks enable row level security;
alter table public.speaking_topics enable row level security;
alter table public.settings enable row level security;

-- Public read: published content only (settings + categories are public info)
create policy "public read tests" on public.tests for select using (published = true);
create policy "public read questions" on public.questions for select
  using (exists (select 1 from public.tests t where t.id = test_id and t.published = true));
create policy "public read lessons" on public.lessons for select using (published = true);
create policy "public read writing" on public.writing_tasks for select using (published = true);
create policy "public read speaking" on public.speaking_topics for select using (published = true);
create policy "public read categories" on public.categories for select using (true);
create policy "public read settings" on public.settings for select using (true);

-- Admin (any authenticated user) full access
create policy "admin all tests" on public.tests for all to authenticated using (true) with check (true);
create policy "admin all questions" on public.questions for all to authenticated using (true) with check (true);
create policy "admin all lessons" on public.lessons for all to authenticated using (true) with check (true);
create policy "admin all writing" on public.writing_tasks for all to authenticated using (true) with check (true);
create policy "admin all speaking" on public.speaking_topics for all to authenticated using (true) with check (true);
create policy "admin all categories" on public.categories for all to authenticated using (true) with check (true);
create policy "admin all settings" on public.settings for all to authenticated using (true) with check (true);

-- ---------- File storage for audio/images ----------
insert into storage.buckets (id, name, public) values ('media','media', true)
on conflict (id) do nothing;

create policy "public read media" on storage.objects for select using (bucket_id = 'media');
create policy "admin write media" on storage.objects for insert to authenticated with check (bucket_id = 'media');
create policy "admin update media" on storage.objects for update to authenticated using (bucket_id = 'media');
create policy "admin delete media" on storage.objects for delete to authenticated using (bucket_id = 'media');

-- ---------- Default homepage settings ----------
insert into public.settings (key, value) values
  ('site_name','IELTSwithKaif'),
  ('hero_title','Prepare for IELTS. The smart way.'),
  ('hero_subtitle','Free Reading and Listening practice tests with instant scoring, Writing tasks with model answers, and Speaking practice — all in one place.'),
  ('announcement','New practice tests are added every week. Start a free test below!')
on conflict (key) do nothing;
