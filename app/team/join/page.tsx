'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function JoinTeamPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>}><JoinTeamInner /></Suspense>
}

function JoinTeamInner() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token')
  const [status, setStatus] = useState<'loading' | 'needs-login' | 'joining' | 'done' | 'error'>('loading')
  const [teamName, setTeamName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!token) { setStatus('error'); setErrorMsg('Invalid invite link.'); return }
    checkInvite()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function checkInvite() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch the invite
    const { data: invite } = await supabase
      .from('team_members')
      .select('id, status, team_id, teams(name)')
      .eq('invite_token', token)
      .maybeSingle()

    if (!invite) { setStatus('error'); setErrorMsg('This invite link is invalid or has expired.'); return }
    if (invite.status === 'active') { setStatus('done'); return }

    setTeamName((invite.teams as unknown as { name: string })?.name ?? '')

    if (!user) {
      setStatus('needs-login')
      return
    }

    // Accept the invite
    setStatus('joining')
    const { error } = await supabase
      .from('team_members')
      .update({ user_id: user.id, status: 'active', joined_at: new Date().toISOString() })
      .eq('id', invite.id)

    if (error) { setStatus('error'); setErrorMsg(error.message); return }
    setStatus('done')
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  if (status === 'loading' || status === 'joining') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-500">{status === 'joining' ? 'Joining team…' : 'Checking invite…'}</p>
        </div>
      </div>
    )
  }

  if (status === 'needs-login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">You've been invited</h1>
          <p className="text-gray-500 mb-6">Sign in or create an account to join <strong>{teamName}</strong>.</p>
          <div className="flex flex-col gap-3">
            <Link href={`/sign-in?redirect=/team/join?token=${token}`}>
              <Button className="w-full">Sign In</Button>
            </Link>
            <Link href={`/sign-up?redirect=/team/join?token=${token}`}>
              <Button variant="outline" className="w-full">Create Account</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-md w-full text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">You've joined {teamName}!</h1>
          <p className="text-gray-500 mb-6">Redirecting you to your dashboard…</p>
          <Link href="/dashboard"><Button className="w-full">Go to Dashboard</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-md w-full text-center">
        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid invite</h1>
        <p className="text-gray-500">{errorMsg}</p>
      </div>
    </div>
  )
}
