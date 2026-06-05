import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendSignedNotification } from '@/lib/email'
import { headers } from 'next/headers'

// Statuses from which a proposal may still be signed.
const SIGNABLE_STATUSES = ['sent', 'viewed']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Authorize by the unguessable public_token, never by a client-supplied id.
    const { token, signerName, signerEmail, signatureData } = body

    if (!token || !signerName || !signerEmail || !signatureData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? null

    const supabase = await createServiceClient()

    // Resolve the proposal from the token (service-role, but strictly token-scoped).
    const { data: proposal } = await supabase
      .from('proposals')
      .select('id, title, user_id, status, expires_at, profiles(full_name)')
      .eq('public_token', token)
      .single()

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }
    if (!SIGNABLE_STATUSES.includes(proposal.status)) {
      return NextResponse.json({ error: 'Proposal is not open for signing' }, { status: 409 })
    }
    if (proposal.expires_at && new Date(proposal.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Proposal has expired' }, { status: 409 })
    }

    // Atomic compare-and-set: only the first concurrent request flips a signable
    // proposal to 'signed'. A racing second request matches no row -> 409, so we
    // never write two signatures for one proposal.
    const { data: claimed } = await supabase
      .from('proposals')
      .update({ status: 'signed' })
      .eq('id', proposal.id)
      .in('status', SIGNABLE_STATUSES)
      .select('id')
      .maybeSingle()

    if (!claimed) {
      return NextResponse.json({ error: 'Proposal is not open for signing' }, { status: 409 })
    }

    // Record the signature against the server-resolved proposal id.
    const { data: signature, error: sigError } = await supabase
      .from('signatures')
      .insert({
        proposal_id: proposal.id,
        signer_name: signerName,
        signer_email: signerEmail,
        signature_data: signatureData,
        ip_address: ip,
      })
      // Return only what the client renders — omit signer_email / ip_address.
      .select('id, proposal_id, signer_name, signed_at, signature_data')
      .single()

    if (sigError) throw sigError

    // Notify sender (best-effort).
    const { data: ownerUser } = await supabase.auth.admin.getUserById(proposal.user_id)
    if (ownerUser?.user?.email) {
      const ownerProfile = Array.isArray(proposal.profiles) ? proposal.profiles[0] : proposal.profiles
      await sendSignedNotification({
        ownerEmail: ownerUser.user.email,
        ownerName: ownerProfile?.full_name ?? 'there',
        clientName: signerName,
        proposalTitle: proposal.title,
        proposalId: proposal.id,
      }).catch(() => {}) // don't fail the request if email fails
    }

    return NextResponse.json({ signature })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to save signature' }, { status: 500 })
  }
}
