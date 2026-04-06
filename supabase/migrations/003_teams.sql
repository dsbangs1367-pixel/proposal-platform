-- ========================
-- TEAMS
-- ========================
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.teams enable row level security;

-- ========================
-- TEAM MEMBERS
-- ========================
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  invite_email text not null,
  role text not null default 'member',  -- 'admin' | 'member'
  status text not null default 'pending', -- 'pending' | 'active'
  invite_token uuid not null default gen_random_uuid(),
  invited_at timestamptz not null default now(),
  joined_at timestamptz
);

alter table public.team_members enable row level security;

-- ========================
-- LINK PROPOSALS TO TEAMS
-- ========================
alter table public.proposals
  add column if not exists team_id uuid references public.teams(id) on delete set null;

-- ========================
-- SECURITY DEFINER HELPERS
-- These bypass RLS so policies can reference each other without infinite recursion
-- ========================

create or replace function public.auth_is_team_owner(team_id_param uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.teams
    where id = team_id_param and owner_id = auth.uid()
  )
$$;

create or replace function public.auth_is_team_member(team_id_param uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.team_members
    where team_id = team_id_param
      and user_id = auth.uid()
      and status = 'active'
  )
$$;

create or replace function public.auth_is_team_admin(team_id_param uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.team_members
    where team_id = team_id_param
      and user_id = auth.uid()
      and role = 'admin'
      and status = 'active'
  )
$$;

-- ========================
-- RLS POLICIES (using helper functions — no cross-table recursion)
-- ========================

-- Teams: owner always; members via helper (queries team_members without RLS)
create policy "Team owner and members can read" on public.teams
  for select using (
    auth.uid() = owner_id
    or public.auth_is_team_member(id)
  );

create policy "Owner can manage team" on public.teams
  for all using (auth.uid() = owner_id);

-- Team members: owner/admin can manage; own row + owner can read
create policy "Team owner and admins can manage members" on public.team_members
  for all using (
    public.auth_is_team_owner(team_id)
    or public.auth_is_team_admin(team_id)
  );

create policy "Members can read their own membership" on public.team_members
  for select using (
    user_id = auth.uid()
    or public.auth_is_team_owner(team_id)
  );

-- Team members can read proposals shared with their team
create policy "Team members can read team proposals" on public.proposals
  for select using (
    team_id is not null
    and public.auth_is_team_member(team_id)
  );
