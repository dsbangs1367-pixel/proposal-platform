'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Copy, Loader2 } from 'lucide-react'

interface Props {
  proposalId: string
  /** If true, redirect to /proposals after delete instead of just refreshing */
  redirectOnDelete?: boolean
}

export function ProposalActions({ proposalId, redirectOnDelete = false }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [duplicating, setDuplicating] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this proposal? This cannot be undone.')) return
    setDeleting(true)
    await fetch(`/api/proposals/${proposalId}/delete`, { method: 'DELETE' })
    if (redirectOnDelete) {
      router.push('/proposals')
    } else {
      router.refresh()
    }
  }

  async function handleDuplicate() {
    setDuplicating(true)
    const res = await fetch(`/api/proposals/${proposalId}/duplicate`, { method: 'POST' })
    const data = await res.json()
    if (data.proposal?.id) {
      router.push(`/proposals/${data.proposal.id}`)
    } else {
      setDuplicating(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleDuplicate}
        disabled={duplicating}
        title="Duplicate proposal"
        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors disabled:opacity-50"
      >
        {duplicating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
      </button>
      <button
        onClick={handleDelete}
        disabled={deleting}
        title="Delete proposal"
        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
      >
        {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </div>
  )
}
