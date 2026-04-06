import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { FileText, Plus, TrendingUp, CheckCircle, Clock, BarChart2 } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  type SigWithProposal = { proposal_id: string; signed_at: string; proposals: { created_at: string } }

  // Fetch all proposals for accurate stats + signatures for avg time
  const [{ data: allProposals }, { data: rawSignatures }] = await Promise.all([
    supabase.from('proposals').select('id, status, created_at').eq('user_id', user!.id),
    supabase
      .from('signatures')
      .select('proposal_id, signed_at, proposals!inner(created_at)')
      .eq('proposals.user_id', user!.id),
  ])
  const signatures = rawSignatures as unknown as SigWithProposal[] | null

  const { data: recentProposals } = await supabase
    .from('proposals')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const all = allProposals ?? []
  const sent = all.filter(p => p.status !== 'draft').length
  const signed = all.filter(p => p.status === 'signed' || p.status === 'paid').length
  const pending = all.filter(p => p.status === 'sent' || p.status === 'viewed').length
  const conversionRate = sent > 0 ? Math.round((signed / sent) * 100) : 0

  // Average hours from proposal creation to signature
  let avgDays: number | null = null
  if (signatures && signatures.length > 0) {
    const diffs = signatures.map((sig) => {
      const created = new Date(sig.proposals.created_at).getTime()
      const signedAt = new Date(sig.signed_at).getTime()
      return (signedAt - created) / (1000 * 60 * 60 * 24)
    })
    avgDays = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-0.5">Track your proposals at a glance</p>
        </div>
        <Link
          href="/proposals/new"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg py-2.5 px-4 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Proposal
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Proposals" value={all.length} icon={<TrendingUp />} color="indigo" />
        <StatCard label="Awaiting Signature" value={pending} icon={<Clock />} color="blue" />
        <StatCard label="Signed" value={signed} icon={<CheckCircle />} color="purple" />
        <StatCard
          label="Conversion Rate"
          value={`${conversionRate}%`}
          icon={<BarChart2 />}
          color="green"
          sub={sent > 0 ? `${signed} of ${sent} sent` : 'No proposals sent yet'}
        />
      </div>

      {/* Avg time to sign */}
      {avgDays !== null && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-6 py-4 mb-8 flex items-center gap-4">
          <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-900">
              Average time to sign: <span className="text-indigo-600">{avgDays} day{avgDays !== 1 ? 's' : ''}</span>
            </p>
            <p className="text-xs text-indigo-500 mt-0.5">Based on {signatures?.length} signed proposal{(signatures?.length ?? 0) !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}

      {/* Proposals Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Proposals</h2>
          <Link href="/proposals" className="text-sm text-indigo-600 hover:underline">
            View all
          </Link>
        </div>

        {(recentProposals ?? []).length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No proposals yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first proposal to get started</p>
            <Link
              href="/proposals/new"
              className="inline-flex items-center gap-2 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg py-2 px-4 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Proposal
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="text-left px-6 py-3">Proposal</th>
                <th className="text-left px-6 py-3">Client</th>
                <th className="text-left px-6 py-3">Amount</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">Date</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(recentProposals ?? []).map(proposal => (
                <tr key={proposal.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 text-sm">{proposal.title}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-gray-900">{proposal.client_name || '—'}</p>
                      <p className="text-xs text-gray-400">{proposal.client_email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {proposal.amount ? formatCurrency(proposal.amount, proposal.currency) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={proposal.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(proposal.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/proposals/${proposal.id}`}
                      className="text-sm text-indigo-600 hover:underline font-medium"
                    >
                      Edit
                    </Link>
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

function StatCard({
  label, value, icon, color, sub,
}: {
  label: string
  value: number | string
  icon: React.ReactNode
  color: 'indigo' | 'blue' | 'purple' | 'green'
  sub?: string
}) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg mb-3 [&>svg]:w-4 [&>svg]:h-4 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}
