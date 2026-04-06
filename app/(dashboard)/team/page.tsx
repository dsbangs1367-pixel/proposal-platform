'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, UserPlus, Users, Check, Copy, Crown, Shield, User } from 'lucide-react'
import type { Team, TeamMember } from '@/lib/types'

export default function TeamPage() {
  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [teamName, setTeamName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
  const [creating, setCreating] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTeam()
  }, [])

  async function loadTeam() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: teamData } = await supabase
      .from('teams')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle()
    if (teamData) {
      setTeam(teamData)
      const { data: memberData } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamData.id)
        .order('invited_at', { ascending: false })
      setMembers(memberData ?? [])
    }
    setLoading(false)
  }

  async function handleCreateTeam() {
    if (!teamName.trim()) return
    setCreating(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error: err } = await supabase
      .from('teams')
      .insert({ name: teamName.trim(), owner_id: user!.id })
      .select()
      .single()
    if (err) { setError(err.message); setCreating(false); return }
    setTeam(data)
    setCreating(false)
  }

  async function handleInvite() {
    if (!inviteEmail.trim() || !team) return
    setInviting(true)
    setError('')
    const res = await fetch('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId: team.id, email: inviteEmail.trim(), role: inviteRole }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed to send invite'); setInviting(false); return }
    setMembers(m => [data.member, ...m])
    setInviteEmail('')
    setInviting(false)
  }

  function copyInviteLink(token: string) {
    navigator.clipboard.writeText(`${window.location.origin}/team/join?token=${token}`)
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
  }

  if (!team) {
    return (
      <div className="p-8 max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-500 mt-0.5">Create a team to collaborate on proposals with colleagues</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="font-semibold text-gray-900 mb-1">Create your team</h2>
          <p className="text-sm text-gray-500 mb-5">Invite colleagues to create, edit, and manage proposals together.</p>
          <div className="space-y-1.5 mb-4">
            <Label>Team Name</Label>
            <Input
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="e.g. Nexa-Flow Proposals Team"
            />
          </div>
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <Button onClick={handleCreateTeam} disabled={creating || !teamName.trim()} className="w-full">
            {creating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating…</> : <><Users className="w-4 h-4 mr-2" />Create Team</>}
          </Button>
        </div>
      </div>
    )
  }

  const roleIcon = (role: string) =>
    role === 'admin' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />

  const statusColor = (status: string) =>
    status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-amber-500" /> You are the owner
            </p>
          </div>
        </div>
      </div>

      {/* Invite */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-indigo-600" /> Invite a Team Member
        </h2>
        <div className="flex gap-3 items-end">
          <div className="flex-1 space-y-1.5">
            <Label>Email Address</Label>
            <Input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="colleague@organization.com"
            />
          </div>
          <div className="w-36 space-y-1.5">
            <Label>Role</Label>
            <Select value={inviteRole} onValueChange={v => setInviteRole(v as 'admin' | 'member')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()} className="shrink-0">
            {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Invite'}
          </Button>
        </div>
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        <p className="text-xs text-gray-400 mt-3">
          <strong>Member:</strong> can create and edit proposals. &nbsp;
          <strong>Admin:</strong> can also invite and remove members.
        </p>
      </div>

      {/* Members list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Team Members ({members.length})</h2>
        </div>
        {members.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No members yet. Invite someone above.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="text-left px-6 py-3">Email</th>
                <th className="text-left px-6 py-3">Role</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{m.invite_email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600">
                      {roleIcon(m.role)} {m.role.charAt(0).toUpperCase() + m.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusColor(m.status)}`}>
                      {m.status === 'active' ? <Check className="w-3 h-3" /> : null}
                      {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {m.status === 'pending' && (
                      <button
                        onClick={() => copyInviteLink(m.invite_token)}
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                      >
                        {copied === m.invite_token ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy link</>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
