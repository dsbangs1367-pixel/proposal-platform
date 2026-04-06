import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: original } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!original) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })

    const { data: copy, error } = await supabase
      .from('proposals')
      .insert({
        user_id: user.id,
        title: `Copy of ${original.title}`,
        client_name: original.client_name,
        client_email: original.client_email,
        content: original.content,
        amount: original.amount,
        currency: original.currency,
        status: 'draft',
        // public_token and expires_at are intentionally omitted — DB generates a fresh token, no expiry on copy
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ proposal: copy })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to duplicate proposal' }, { status: 500 })
  }
}
