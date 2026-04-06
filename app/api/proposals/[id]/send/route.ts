import { NextResponse, type NextRequest } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendProposalToClient } from '@/lib/email'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: proposal } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!proposal) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (proposal.client_email) {
      const baseUrl = profile?.custom_domain
        ? `https://${profile.custom_domain}`
        : undefined
      await sendProposalToClient({
        clientEmail: proposal.client_email,
        clientName: proposal.client_name || 'there',
        senderCompany: profile?.company_name ?? 'ProposalFlow',
        proposalTitle: proposal.title,
        publicToken: proposal.public_token,
        brandColor: profile?.brand_color,
        baseUrl,
      })
    }

    // Mark as sent
    await supabase.from('proposals').update({ status: 'sent' }).eq('id', id)

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to send proposal' }, { status: 500 })
  }
}
