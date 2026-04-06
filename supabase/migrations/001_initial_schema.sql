-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ========================
-- PROFILES
-- ========================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company_name text,
  company_logo_url text,
  plan text not null default 'free',
  created_at timestamptz not null default now()
);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- ========================
-- PROPOSALS
-- ========================
create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled Proposal',
  client_name text not null default '',
  client_email text not null default '',
  content jsonb,
  status text not null default 'draft',
  amount numeric(12,2),
  currency text not null default 'USD',
  public_token uuid not null unique default gen_random_uuid(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger proposals_updated_at
  before update on public.proposals
  for each row execute function public.set_updated_at();

-- RLS
alter table public.proposals enable row level security;
create policy "Users can CRUD own proposals" on public.proposals
  for all using (auth.uid() = user_id);
create policy "Public can view proposal by token" on public.proposals
  for select using (true);  -- filtered by token in app code; RLS is permissive here for client pages

-- ========================
-- SIGNATURES
-- ========================
create table if not exists public.signatures (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  signature_data text not null,
  signer_name text not null,
  signer_email text not null,
  signed_at timestamptz not null default now(),
  ip_address text
);

alter table public.signatures enable row level security;
-- Anyone can insert (clients sign without auth)
create policy "Anyone can insert signature" on public.signatures
  for insert with check (true);
-- Only proposal owner can read
create policy "Proposal owner can read signatures" on public.signatures
  for select using (
    exists (
      select 1 from public.proposals
      where proposals.id = signatures.proposal_id
      and proposals.user_id = auth.uid()
    )
  );

-- ========================
-- PAYMENTS
-- ========================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  flutterwave_tx_ref text not null,
  flutterwave_tx_id text,
  amount numeric(12,2) not null,
  currency text not null,
  status text not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;
-- Service role inserts via webhook (bypasses RLS)
create policy "Proposal owner can read payments" on public.payments
  for select using (
    exists (
      select 1 from public.proposals
      where proposals.id = payments.proposal_id
      and proposals.user_id = auth.uid()
    )
  );

-- ========================
-- TEMPLATES
-- ========================
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  content jsonb not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.templates enable row level security;
-- Users can read system templates (user_id is null) and their own
create policy "Users can read available templates" on public.templates
  for select using (user_id is null or auth.uid() = user_id);
create policy "Users can manage own templates" on public.templates
  for all using (auth.uid() = user_id);

-- ========================
-- STORAGE BUCKETS
-- ========================
insert into storage.buckets (id, name, public) values ('logos', 'logos', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('signatures', 'signatures', false) on conflict do nothing;

create policy "Users can upload their logo" on storage.objects
  for insert with check (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Logos are publicly readable" on storage.objects
  for select using (bucket_id = 'logos');
