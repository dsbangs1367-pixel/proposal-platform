import { notFound } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { ClientProposalView } from './client-view'
import { ExpiredView } from './expired-view'
import { sendViewedNotification } from '@/lib/email'
import type { Proposal, Signature, Profile } from '@/lib/types'

export default async function PublicProposalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  const { data: proposal } = await supabase
    .from('proposals')
    .select('*')
    .eq('public_token', token)
    .single()

  if (!proposal) notFound()

  // Fetch signature and profile once — reused for expiry check and rendering
  const [{ data: signature }, { data: profile }] = await Promise.all([
    supabase.from('signatures').select('*').eq('proposal_id', proposal.id).maybeSingle(),
    supabase.from('profiles').select('*').eq('id', proposal.user_id).single(),
  ])

  // Check expiry — still show if already signed
  if (proposal.expires_at && new Date(proposal.expires_at) < new Date() && !signature) {
    return <ExpiredView proposal={proposal as Proposal} senderProfile={profile as Profile | null} />
  }

  if (proposal.status === 'sent') {
    await supabase.from('proposals').update({ status: 'viewed' }).eq('id', proposal.id)
    proposal.status = 'viewed'
    // Notify owner in parallel — don't block page render on email failure
    const svc = await createServiceClient().catch(() => null)
    if (svc) {
      const { data: ownerUser } = await svc.auth.admin.getUserById(proposal.user_id)
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

  return (
    <ClientProposalView
      proposal={proposal as Proposal}
      signature={signature as Signature | null}
      senderProfile={profile as Profile | null}
    />
  )
}
