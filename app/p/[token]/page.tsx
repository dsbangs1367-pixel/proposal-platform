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

  // Check expiry
  if (proposal.expires_at && new Date(proposal.expires_at) < new Date()) {
    const [{ data: signature }, { data: profile }] = await Promise.all([
      supabase.from('signatures').select('*').eq('proposal_id', proposal.id).maybeSingle(),
      supabase.from('profiles').select('*').eq('id', proposal.user_id).single(),
    ])
    // Still show if already signed — expiry only blocks unsigned proposals
    if (!signature) {
      return <ExpiredView proposal={proposal as Proposal} senderProfile={profile as Profile | null} />
    }
  }

  if (proposal.status === 'sent') {
    await supabase.from('proposals').update({ status: 'viewed' }).eq('id', proposal.id)
    proposal.status = 'viewed'
    // Notify owner — fire and forget, don't block page render
    createServiceClient().then(async (svc) => {
      const { data: ownerUser } = await svc.auth.admin.getUserById(proposal.user_id)
      const { data: profile } = await svc.from('profiles').select('full_name').eq('id', proposal.user_id).single()
      if (ownerUser?.user?.email) {
        sendViewedNotification({
          ownerEmail: ownerUser.user.email,
          ownerName: profile?.full_name ?? 'there',
          clientName: proposal.client_name || 'Your client',
          proposalTitle: proposal.title,
          proposalId: proposal.id,
        }).catch(() => {})
      }
    }).catch(() => {})
  }

  const [{ data: signature }, { data: profile }] = await Promise.all([
    supabase.from('signatures').select('*').eq('proposal_id', proposal.id).maybeSingle(),
    supabase.from('profiles').select('*').eq('id', proposal.user_id).single(),
  ])

  return (
    <ClientProposalView
      proposal={proposal as Proposal}
      signature={signature as Signature | null}
      senderProfile={profile as Profile | null}
    />
  )
}
