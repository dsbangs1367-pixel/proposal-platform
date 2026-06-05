import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createPaymentLink } from '@/lib/flutterwave'

// A proposal may be paid once it has been sent/viewed/signed — never while a draft
// (not yet shared) or already paid.
const PAYABLE_STATUSES = ['sent', 'viewed', 'signed']

export async function POST(request: NextRequest) {
  try {
    // Authorize by the unguessable public_token, never by a client-supplied id.
    const { token, customerEmail, customerName } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    const { data: proposal } = await supabase
      .from('proposals')
      .select('id, public_token, amount, currency, status, expires_at, title')
      .eq('public_token', token)
      .single()

    if (!proposal || !proposal.amount) {
      return NextResponse.json({ error: 'Proposal or amount not found' }, { status: 404 })
    }
    if (!PAYABLE_STATUSES.includes(proposal.status)) {
      return NextResponse.json({ error: 'Proposal is not open for payment' }, { status: 409 })
    }
    if (proposal.expires_at && new Date(proposal.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Proposal has expired' }, { status: 409 })
    }

    const txRef = `proposal-${proposal.id}-${Date.now()}`

    // Record pending payment against the server-resolved proposal id.
    await supabase.from('payments').insert({
      proposal_id: proposal.id,
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
