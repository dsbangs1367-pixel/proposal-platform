import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendTeamInvite } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { teamId, email, role } = await request.json()
    if (!teamId || !email || !role) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify the user owns or admins this team
    const { data: team } = await supabase
      .from('teams')
      .select('id, name, owner_id')
      .eq('id', teamId)
      .single()

    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 })

    const isOwner = team.owner_id === user.id
    if (!isOwner) {
      const { data: myMembership } = await supabase
        .from('team_members')
        .select('role, status')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .single()
      if (!myMembership || myMembership.role !== 'admin' || myMembership.status !== 'active') {
        return NextResponse.json({ error: 'Not authorized to invite' }, { status: 403 })
      }
    }

    // Check not already a member
    const { data: existing } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('invite_email', email)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'This email has already been invited' }, { status: 409 })
    }

    // Insert the member record
    const { data: member, error: insertErr } = await supabase
      .from('team_members')
      .insert({ team_id: teamId, invite_email: email, role })
      .select()
      .single()

    if (insertErr) throw insertErr

    // Get inviter name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    await sendTeamInvite({
      inviteEmail: email,
      inviterName: profile?.full_name ?? user.email ?? 'A colleague',
      teamName: team.name,
      inviteToken: member.invite_token,
    }).catch(() => {}) // don't fail if email fails

    return NextResponse.json({ member })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 })
  }
}
