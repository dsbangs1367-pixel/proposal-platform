-- ============================================================================
-- 004_rls_hardening.sql  —  DIG-11 (AI-Gov, Layers 4/5)
--
-- Problem: the proposals SELECT policy was `using (true)`, and the Supabase
-- anon key ships in client JS, so ANY anonymous caller could enumerate every
-- tenant's proposals (titles, client emails, amounts, content, tokens) with a
-- bare `select * from proposals`. The public client flow only ever needs ONE
-- proposal, addressed by its unguessable `public_token`.
--
-- Fix: remove the permissive policy and serve the public /p/[token] page through
-- security-definer accessors keyed strictly on the token. Owner + team read
-- policies are untouched. Idempotent / safe to re-run.
-- ============================================================================

-- 1. Remove the table-enumeration hole. Keeps:
--    - "Users can CRUD own proposals"            (001, owner: auth.uid() = user_id)
--    - "Team members can read team proposals"    (003, via auth_is_team_member())
drop policy if exists "Public can view proposal by token" on public.proposals;

-- 2. Public read accessor: returns exactly ONE proposal (by exact token) bundled
--    with its signature and the sender's public branding, so the anon client
--    never touches the proposals/profiles/signatures tables directly. This also
--    fixes a latent gap: the owner-only profiles/signatures policies meant anon
--    viewers previously saw default branding and no signature.
create or replace function public.get_public_proposal(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  -- Project ONLY public-safe proposal fields. Deliberately omit user_id (owner's
  -- auth id), client_email (recipient PII) and team_id — they would otherwise be
  -- serialised into the public page's HTML. The server re-resolves user_id by
  -- token via the service-role client when it needs to notify the owner.
  select jsonb_build_object(
    'proposal', jsonb_build_object(
      'id',           p.id,
      'title',        p.title,
      'client_name',  p.client_name,
      'content',      p.content,
      'status',       p.status,
      'amount',       p.amount,
      'currency',     p.currency,
      'public_token', p.public_token,
      'expires_at',   p.expires_at,
      'created_at',   p.created_at
    ),
    'signature', case when s.id is null then null else jsonb_build_object(
      'id',             s.id,
      'proposal_id',    s.proposal_id,
      'signer_name',    s.signer_name,
      'signed_at',      s.signed_at,
      'signature_data', s.signature_data
    ) end,
    'profile', case when pr.id is null then null else jsonb_build_object(
      'full_name',        pr.full_name,
      'company_name',     pr.company_name,
      'company_logo_url', pr.company_logo_url,
      'brand_color',      pr.brand_color,
      'company_website',  pr.company_website,
      'company_phone',    pr.company_phone,
      'company_address',  pr.company_address
    ) end
  )
  from public.proposals p
  left join public.signatures s on s.proposal_id = p.id
  left join public.profiles  pr on pr.id = p.user_id
  where p.public_token = p_token
  -- Defensive: one bundle row even if a proposal ever has >1 signature (latest wins).
  order by s.signed_at desc nulls last
  limit 1;
$$;
revoke all on function public.get_public_proposal(uuid) from public;
grant execute on function public.get_public_proposal(uuid) to anon, authenticated;

-- 3. Mark-viewed accessor: flips sent -> viewed for the token's proposal, without
--    granting anon a broad UPDATE policy. (The previous anon `.update()` on the
--    public page was silently denied by RLS, so view tracking never worked.)
--    Returns true on the sent->viewed transition and NULL (no row updated) on a
--    no-op; the server treats only a truthy result as "just transitioned" and
--    fires the "viewed" owner notification exactly once. Intentionally exec by anon:
--    it carries no data and can only set viewed-once for a proposal whose
--    unguessable token the caller already holds (idempotent via `status='sent'`).
create or replace function public.mark_proposal_viewed(p_token uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  update public.proposals
     set status = 'viewed'
   where public_token = p_token
     and status = 'sent'
  returning true;
$$;
revoke all on function public.mark_proposal_viewed(uuid) from public;
grant execute on function public.mark_proposal_viewed(uuid) to anon, authenticated;

-- 4. Tighten signature inserts. The old `with check (true)` policy let anyone
--    insert a signature for ANY proposal id directly via the public anon key,
--    bypassing the server route. Signature writes now happen ONLY through the
--    server route (service-role), which validates the public_token first.
drop policy if exists "Anyone can insert signature" on public.signatures;

-- 5. Signatures storage bucket: it is private (public=false) and currently UNUSED
--    (signatures are stored as base64 `signature_data` in the signatures table;
--    only the `logos` bucket is used). With RLS on storage.objects and no policy
--    granting access, anon/authenticated reads are denied by default — i.e. it is
--    already locked down. No policy added here on purpose: inventing a path-based
--    policy for a bucket with no established key convention would be misleading.
--    If signature *files* are ever introduced, add an owner-scoped SELECT policy
--    on storage.objects for bucket_id = 'signatures' at that time.

-- 6. payments: INSERT/UPDATE remain server-only via the service-role client
--    (webhook + initialize). No anon INSERT policy exists, so anon cannot write
--    payments directly. SELECT stays owner-only ("Proposal owner can read
--    payments", 001). Documented; no change.
