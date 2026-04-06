import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClientProposalView } from './client-view'
import type { Proposal, Signature, Payment, Profile } from '@/lib/types'

export default async function PublicProposalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  // Fetch proposal by public token
  const { data: proposal } = await supabase
    .from('proposals')
    .select('*')
    .eq('public_token', token)
    .single()

  if (!proposal) notFound()

  // Mark as viewed if it was sent
  if (proposal.status === 'sent') {
    await supabase.from('proposals').update({ status: 'viewed' }).eq('id', proposal.id)
    proposal.status = 'viewed'
  }

  // Fetch existing signature
  const { data: signature } = await supabase
    .from('signatures')
    .select('*')
    .eq('proposal_id', proposal.id)
    .maybeSingle()

  // Fetch payment
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('proposal_id', proposal.id)
    .eq('status', 'successful')
    .maybeSingle()

  // Fetch sender profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', proposal.user_id)
    .single()

  return (
    <ClientProposalView
      proposal={proposal as Proposal}
      signature={signature as Signature | null}
      payment={payment as Payment | null}
      senderProfile={profile as Profile | null}
    />
  )
}
