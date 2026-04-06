import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createPaymentLink } from '@/lib/flutterwave'

export async function POST(request: NextRequest) {
  try {
    const { proposalId, customerEmail, customerName } = await request.json()
    const supabase = await createServiceClient()

    const { data: proposal } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', proposalId)
      .single()

    if (!proposal || !proposal.amount) {
      return NextResponse.json({ error: 'Proposal or amount not found' }, { status: 404 })
    }

    const txRef = `proposal-${proposalId}-${Date.now()}`

    // Record pending payment
    await supabase.from('payments').insert({
      proposal_id: proposalId,
      flutterwave_tx_ref: txRef,
      amount: proposal.amount,
      currency: proposal.currency,
      status: 'pending',
    })

    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/p/${proposal.public_token}?payment=complete`

    const paymentUrl = await createPaymentLink({
      txRef,
      amount: proposal.amount,
      currency: proposal.currency,
      customerEmail,
      customerName,
      proposalTitle: proposal.title,
      redirectUrl,
    })

    return NextResponse.json({ paymentUrl })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 })
  }
}
