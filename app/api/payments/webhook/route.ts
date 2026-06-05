import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendPaidNotification } from '@/lib/email'
import crypto from 'crypto'

// Length-safe constant-time string compare (avoids early-exit timing leaks and
// the throw from crypto.timingSafeEqual on unequal-length buffers).
function timingSafeEqualStr(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('verif-hash')

    // Verify the webhook is from Flutterwave (fails closed on any mismatch).
    //
    // Flutterwave sends the dashboard "Secret hash" (Settings > Webhooks) verbatim
    // in the `verif-hash` header — it is a STATIC secret compared directly, NOT an
    // HMAC of the request body. (The previous HMAC-of-body scheme rejected every
    // legitimate webhook, so payments were never marked paid via this path.)
    // Requires FLUTTERWAVE_WEBHOOK_HASH to be set in the environment — see DIG-18.
    const expectedHash = process.env.FLUTTERWAVE_WEBHOOK_HASH
    if (!expectedHash || !signature || !timingSafeEqualStr(signature, expectedHash)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(rawBody)

    if (event.event === 'charge.completed' && event.data?.status === 'successful') {
      const txRef: string = event.data.tx_ref
      const txId: string = String(event.data.id)
      const amount: number = event.data.amount
      const currency: string = event.data.currency

      const supabase = await createServiceClient()

      // Find payment by tx_ref (narrow the proposals join to only what's used below)
      const { data: payment } = await supabase
        .from('payments')
        .select('id, proposals(id, title, user_id)')
        .eq('flutterwave_tx_ref', txRef)
        .single()

      if (!payment) return NextResponse.json({ received: true })

      // Update payment
      await supabase.from('payments').update({
        flutterwave_tx_id: txId,
        status: 'successful',
        paid_at: new Date().toISOString(),
      }).eq('flutterwave_tx_ref', txRef)

      // Update proposal status (supabase types a to-one embed as an array)
      const proposal = Array.isArray(payment.proposals) ? payment.proposals[0] : payment.proposals
      if (proposal) {
        await supabase.from('proposals').update({ status: 'paid' }).eq('id', proposal.id)

        // Get signature for client name
        const { data: sig } = await supabase
          .from('signatures')
          .select('signer_name')
          .eq('proposal_id', proposal.id)
          .maybeSingle()

        // Notify sender
        const { data: ownerUser } = await supabase.auth.admin.getUserById(proposal.user_id)
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', proposal.user_id)
          .single()

        if (ownerUser?.user?.email) {
          await sendPaidNotification({
            ownerEmail: ownerUser.user.email,
            ownerName: profile?.full_name ?? 'there',
            clientName: sig?.signer_name ?? 'Your client',
            proposalTitle: proposal.title,
            amount,
            currency,
            proposalId: proposal.id,
          }).catch(() => {})
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: unknown) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Flutterwave sends raw body — disable Next.js body parsing
export const dynamic = 'force-dynamic'
