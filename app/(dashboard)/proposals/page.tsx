import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, FileText, ExternalLink } from 'lucide-react'
import { ProposalActions } from '@/components/proposal/proposal-actions'

export default async function ProposalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: proposals } = await supabase
    .from('proposals')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const all = proposals ?? []

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proposals</h1>
          <p className="text-gray-500 mt-0.5">{all.length} proposal{all.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link
          href="/proposals/new"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg py-2.5 px-4 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Proposal
        </Link>
      </div>

      {all.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 text-center py-20">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No proposals yet</p>
          <Link
            href="/proposals/new"
            className="inline-flex items-center gap-2 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg py-2 px-4 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create your first proposal
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="text-left px-6 py-3">Proposal</th>
                <th className="text-left px-6 py-3">Client</th>
                <th className="text-left px-6 py-3">Amount</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">Created</th>
                <th className="text-left px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {all.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 text-sm">{p.title}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{p.client_name || '—'}</p>
                    <p className="text-xs text-gray-400">{p.client_email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {p.amount ? formatCurrency(p.amount, p.currency) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(p.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/proposals/${p.id}`}
                        className="text-sm text-indigo-600 hover:underline font-medium"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/p/${p.public_token}`}
                        target="_blank"
                        className="text-gray-400 hover:text-gray-600"
                        title="View client page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <ProposalActions proposalId={p.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
