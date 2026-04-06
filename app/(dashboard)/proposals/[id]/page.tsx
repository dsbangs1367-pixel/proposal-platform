'use client'

import { use, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ProposalEditor } from '@/components/editor/proposal-editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/ui/badge'
import type { Proposal } from '@/lib/types'
import {
  Save, Send, Eye, ArrowLeft, Copy, Check, Loader2, ExternalLink
} from 'lucide-react'

export default function ProposalEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [content, setContent] = useState<object | null>(null)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('proposals').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        setProposal(data)
        setContent(data.content)
      }
      setLoading(false)
    })
  }, [id])

  const handleSave = useCallback(async () => {
    if (!proposal) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('proposals').update({
      title: proposal.title,
      client_name: proposal.client_name,
      client_email: proposal.client_email,
      amount: proposal.amount,
      currency: proposal.currency,
      expires_at: proposal.expires_at || null,
      content,
    }).eq('id', id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [proposal, content, id])

  // Auto-save every 30s
  useEffect(() => {
    const interval = setInterval(handleSave, 30000)
    return () => clearInterval(interval)
  }, [handleSave])

  async function handleSend() {
    if (!proposal) return
    setSending(true)
    await handleSave()
    await fetch(`/api/proposals/${id}/send`, { method: 'POST' })
    setProposal(p => p ? { ...p, status: 'sent' } : p)
    setSending(false)
  }

  function copyLink() {
    const url = `${window.location.origin}/p/${proposal?.public_token}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Proposal not found.</p>
        <Link href="/proposals" className="text-indigo-600 hover:underline mt-2 inline-block">Back to proposals</Link>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Editor area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/proposals" className="text-gray-400 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <input
                className="text-lg font-semibold text-gray-900 bg-transparent border-0 outline-none focus:ring-0 p-0 w-80"
                value={proposal.title}
                onChange={e => setProposal(p => p ? { ...p, title: e.target.value } : p)}
                placeholder="Proposal title"
              />
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge status={proposal.status} />
                {saved && <span className="text-xs text-green-600">Saved</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyLink}>
              {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Link href={`/p/${proposal.public_token}`} target="_blank">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-1.5" />
                Preview
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
              Save
            </Button>
            <Button size="sm" onClick={handleSend} disabled={sending || proposal.status !== 'draft'}>
              {sending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Send className="w-4 h-4 mr-1.5" />}
              {proposal.status === 'draft' ? 'Send to Client' : 'Sent'}
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
          <ProposalEditor
            content={content}
            onChange={setContent}
          />
        </div>
      </div>

      {/* Right sidebar */}
      <div className="w-72 shrink-0 border-l border-gray-200 bg-white overflow-y-auto p-5 space-y-5">
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Proposal Details</h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Client Name</Label>
              <Input
                placeholder="Organization name"
                value={proposal.client_name}
                onChange={e => setProposal(p => p ? { ...p, client_name: e.target.value } : p)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Client Email</Label>
              <Input
                type="email"
                placeholder="client@org.com"
                value={proposal.client_email}
                onChange={e => setProposal(p => p ? { ...p, client_email: e.target.value } : p)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="0"
                value={proposal.amount ?? ''}
                onChange={e => setProposal(p => p ? { ...p, amount: parseFloat(e.target.value) || null } : p)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select
                value={proposal.currency}
                onValueChange={v => setProposal(p => p ? { ...p, currency: v } : p)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['USD', 'GBP', 'EUR', 'SLL', 'NGN', 'KES', 'GHS'].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={proposal.expires_at ? proposal.expires_at.slice(0, 10) : ''}
                onChange={e => setProposal(p => p ? { ...p, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null } : p)}
              />
              <p className="text-xs text-gray-400">Client cannot sign after this date.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <h3 className="font-semibold text-gray-900 mb-3">Client Link</h3>
          <p className="text-xs text-gray-500 mb-3">Share this link with your client to view, sign, and pay.</p>
          <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
            <code className="text-xs text-gray-600 flex-1 break-all">
              {typeof window !== 'undefined' ? `${window.location.origin}/p/${proposal.public_token}` : `/p/${proposal.public_token}`}
            </code>
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={copyLink} className="flex-1 text-xs">
              {copied ? <><Check className="w-3 h-3 mr-1" /> Copied</> : <><Copy className="w-3 h-3 mr-1" /> Copy</>}
            </Button>
            <Link href={`/p/${proposal.public_token}`} target="_blank" className="flex-1">
              <Button variant="outline" size="sm" className="w-full text-xs">
                <ExternalLink className="w-3 h-3 mr-1" /> Open
              </Button>
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <h3 className="font-semibold text-gray-900 mb-1">Status</h3>
          <StatusBadge status={proposal.status} />
          <p className="text-xs text-gray-400 mt-2">
            {proposal.status === 'draft' && 'Click "Send to Client" to email the proposal link.'}
            {proposal.status === 'sent' && 'Awaiting client review.'}
            {proposal.status === 'viewed' && 'Client has opened the proposal.'}
            {proposal.status === 'signed' && 'Client has signed. Proposal complete.'}
            {proposal.status === 'paid' && 'Payment received. All done!'}
            {proposal.status === 'expired' && 'This proposal has passed its expiry date.'}
          </p>
        </div>
      </div>
    </div>
  )
}
