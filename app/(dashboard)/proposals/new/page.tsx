'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles, FileText, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { SYSTEM_TEMPLATES } from '@/lib/templates'

type Mode = 'choose' | 'ai' | 'template'

export default function NewProposalPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('choose')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // AI form fields
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [projectType, setProjectType] = useState('')
  const [scopeDescription, setScopeDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [timeline, setTimeline] = useState('')
  const [tone, setTone] = useState('formal')

  async function handleAIGenerate() {
    if (!clientName || !projectType || !scopeDescription) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single()

      const res = await fetch('/api/proposals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName, projectType, scopeDescription, amount, currency, timeline, tone,
          senderCompany: profile?.company_name ?? '',
          senderName: profile?.full_name ?? '',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')

      // Create proposal in DB with generated content
      const { data: proposal, error: dbError } = await supabase
        .from('proposals')
        .insert({
          user_id: user!.id,
          title: data.title,
          client_name: clientName,
          client_email: clientEmail,
          content: data.content,
          amount: amount ? parseFloat(amount) : null,
          currency,
          status: 'draft',
        })
        .select()
        .single()

      if (dbError) throw new Error(dbError.message)
      router.push(`/proposals/${proposal!.id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg || 'An unexpected error occurred.')
      setLoading(false)
    }
  }

  async function handleTemplateSelect(templateId: string) {
    setLoading(true)
    const template = SYSTEM_TEMPLATES.find(t => t.id === templateId)
    if (!template) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: proposal } = await supabase
      .from('proposals')
      .insert({
        user_id: user!.id,
        title: template.name,
        content: template.content,
        status: 'draft',
      })
      .select()
      .single()
    router.push(`/proposals/${proposal!.id}`)
  }

  if (mode === 'choose') {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/proposals" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Proposals
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create a Proposal</h1>
          <p className="text-gray-500 mt-1">Choose how you&apos;d like to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setMode('ai')}
            className="group bg-white border-2 border-gray-200 hover:border-indigo-400 rounded-xl p-6 text-left transition-all hover:shadow-md"
          >
            <div className="w-10 h-10 bg-indigo-100 group-hover:bg-indigo-600 rounded-lg flex items-center justify-center mb-4 transition-colors">
              <Sparkles className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1">AI Generate</h3>
            <p className="text-gray-500 text-sm">Fill in a brief and Claude AI will write your full proposal. Takes about 10 seconds.</p>
            <span className="inline-block mt-3 text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">Recommended</span>
          </button>

          <button
            onClick={() => setMode('template')}
            className="group bg-white border-2 border-gray-200 hover:border-indigo-400 rounded-xl p-6 text-left transition-all hover:shadow-md"
          >
            <div className="w-10 h-10 bg-gray-100 group-hover:bg-indigo-600 rounded-lg flex items-center justify-center mb-4 transition-colors">
              <FileText className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1">From Template</h3>
            <p className="text-gray-500 text-sm">Pick a professionally structured template and fill it in manually with your own content.</p>
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'template') {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <button onClick={() => setMode('choose')} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Choose a Template</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SYSTEM_TEMPLATES.map(template => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template.id)}
              disabled={loading}
              className="bg-white border border-gray-200 hover:border-indigo-400 rounded-xl p-5 text-left transition-all hover:shadow-md group"
            >
              <div className="mb-3">
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">
                  {template.category.replace('_', ' ')}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">{template.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{template.description}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <button onClick={() => setMode('choose')} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">AI Proposal Generator</h1>
        <p className="text-gray-500 mt-1">Fill in the brief — Claude will write your proposal</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Client Name *</Label>
            <Input placeholder="WHO / Ministry of Health" value={clientName} onChange={e => setClientName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Client Email</Label>
            <Input type="email" placeholder="client@org.com" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Project Type *</Label>
          <Select value={projectType} onValueChange={setProjectType}>
            <SelectTrigger>
              <SelectValue placeholder="Select project type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="digital_health_consulting">Digital Health Consulting</SelectItem>
              <SelectItem value="software_implementation">Software Implementation</SelectItem>
              <SelectItem value="supply_chain_optimization">Supply Chain Optimization</SelectItem>
              <SelectItem value="data_analytics">Data Analytics & Reporting</SelectItem>
              <SelectItem value="training_capacity_building">Training & Capacity Building</SelectItem>
              <SelectItem value="grant_proposal">Grant Proposal</SelectItem>
              <SelectItem value="partnership">Partnership / MOU</SelectItem>
              <SelectItem value="general_consulting">General Consulting</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Scope & Objectives *</Label>
          <Textarea
            className="h-28"
            placeholder="Describe the problem you're solving and what you'll deliver. E.g. 'Deploy CommCare for 50 community health workers in Port Loko district, integrate with national DHIS2, train staff, and provide 6 months of support.'"
            value={scopeDescription}
            onChange={e => setScopeDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5 col-span-2">
            <Label>Budget Amount</Label>
            <Input type="number" placeholder="25000" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="SLL">SLL</SelectItem>
                <SelectItem value="NGN">NGN</SelectItem>
                <SelectItem value="KES">KES</SelectItem>
                <SelectItem value="GHS">GHS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Timeline</Label>
            <Input placeholder="e.g. 3 months, Q2 2026" value={timeline} onChange={e => setTimeline(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">Formal (Government / Donor)</SelectItem>
                <SelectItem value="professional">Professional (Corporate)</SelectItem>
                <SelectItem value="friendly">Friendly (Startup / NGO)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
        )}

        <Button onClick={handleAIGenerate} disabled={loading} className="w-full" size="lg">
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating your proposal…</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> Generate Proposal with AI</>
          )}
        </Button>
      </div>
    </div>
  )
}
