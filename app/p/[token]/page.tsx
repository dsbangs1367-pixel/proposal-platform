import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClientProposalView } from './client-view'
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

  if (proposal.status === 'sent') {
    await supabase.from('proposals').update({ status: 'viewed' }).eq('id', proposal.id)
    proposal.status = 'viewed'
  }

  const { data: signature } = await supabase
    .from('signatures')
    .select('*')
    .eq('proposal_id', proposal.id)
    .maybeSingle()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', proposal.user_id)
    .single()

  return (
    <ClientProposalView
      proposal={proposal as Proposal}
      signature={signature as Signature | null}
      senderProfile={profile as Profile | null}
    />
  )
}
