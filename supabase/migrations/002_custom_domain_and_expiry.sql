-- Add custom domain to profiles
alter table public.profiles
  add column if not exists custom_domain text,
  add column if not exists company_address text,
  add column if not exists company_phone text,
  add column if not exists company_website text,
  add column if not exists brand_color text not null default '#4f46e5';

-- Index for faster proposal expiry queries
create index if not exists proposals_expires_at_idx on public.proposals (expires_at)
  where expires_at is not null;
