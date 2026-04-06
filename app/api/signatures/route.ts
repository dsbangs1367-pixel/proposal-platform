import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendSignedNotification } from '@/lib/email'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { proposalId, signerName, signerEmail, signatureData } = body

    if (!proposalId || !signerName || !signerEmail || !signatureData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? null

    const supabase = await createServiceClient()

    // Save signature
    const { data: signature, error: sigError } = await supabase
      .from('signatures')
      .insert({ proposal_id: proposalId, signer_name: signerName, signer_email: signerEmail, signature_data: signatureData, ip_address: ip })
      .select()
      .single()

    if (sigError) throw sigError

    // Update proposal status
    await supabase.from('proposals').update({ status: 'signed' }).eq('id', proposalId)

    // Notify sender
    const { data: proposal } = await supabase
      .from('proposals')
      .select('*, profiles(*)')
      .eq('id', proposalId)
      .single()

    if (proposal) {
      const { data: ownerUser } = await supabase.auth.admin.getUserById(proposal.user_id)
      if (ownerUser?.user?.email) {
        await sendSignedNotification({
          ownerEmail: ownerUser.user.email,
          ownerName: proposal.profiles?.full_name ?? 'there',
          clientName: signerName,
          proposalTitle: proposal.title,
          proposalId,
        }).catch(() => {}) // don't fail the request if email fails
      }
    }

    return NextResponse.json({ signature })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to save signature' }, { status: 500 })
  }
}
