import { notFound } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import '@/app/p/proposal-client.css'
import { ClientProposalView } from './client-view'
import { ExpiredView } from './expired-view'
import { sendViewedNotification } from '@/lib/email'
import type { PublicProposal, Signature, Profile } from '@/lib/types'

type PublicProposalBundle = {
  proposal: PublicProposal | null
  signature: Signature | null
  profile: Profile | null
}

export default async function PublicProposalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  // Single security-definer accessor keyed on the unguessable token — the anon
  // client never reads the proposals/profiles/signatures tables directly, so the
  // table cannot be enumerated (see migration 004_rls_hardening.sql).
  const { data } = await supabase.rpc('get_public_proposal', { p_token: token })
  const bundle = data as PublicProposalBundle | null

  if (!bundle?.proposal) notFound()

  const proposal = bundle.proposal
  const signature = bundle.signature
  const profile = bundle.profile

  // Check expiry — still show if already signed
  if (proposal.expires_at && new Date(proposal.expires_at) < new Date() && !signature) {
    return <ExpiredView proposal={proposal} senderProfile={profile} />
  }

  if (proposal.status === 'sent') {
    // Flip sent -> viewed; returns true only on the actual transition.
    const { data: transitioned } = await supabase.rpc('mark_proposal_viewed', { p_token: token })
    if (transitioned) {
      proposal.status = 'viewed'
      // Notify owner — best-effort, never blocks render. user_id is intentionally
      // absent from the public bundle, so re-resolve it server-side by token.
      const svc = await createServiceClient().catch(() => null)
      if (svc) {
        const { data: ownerRow } = await svc
          .from('proposals')
          .select('user_id')
          .eq('public_token', token)
          .single()
        if (ownerRow?.user_id) {
          const { data: ownerUser } = await svc.auth.admin.getUserById(ownerRow.user_id)
          if (ownerUser?.user?.email) {
            await sendViewedNotification({
              ownerEmail: ownerUser.user.email,
              ownerName: profile?.full_name ?? 'there',
              clientName: proposal.client_name || 'Your client',
              proposalTitle: proposal.title,
              proposalId: proposal.id,
            }).catch(() => {})
          }
        }
      }
    }
  }

  return (
    <ClientProposalView
      proposal={proposal}
      signature={signature}
      senderProfile={profile}
    />
  )
}
