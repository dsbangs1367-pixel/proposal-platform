'use client'

import { useState } from 'react'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { SignaturePad } from '@/components/proposal/signature-pad'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Proposal, Signature, Profile } from '@/lib/types'
import { CheckCircle, FileText } from 'lucide-react'

interface Props {
  proposal: Proposal
  signature: Signature | null
  senderProfile: Profile | null
}

export function ClientProposalView({ proposal, signature: initialSig, senderProfile }: Props) {
  const [signature, setSignature] = useState<Signature | null>(initialSig)

  const contentHtml = proposal.content
    ? generateHTML(proposal.content as Parameters<typeof generateHTML>[0], [
        StarterKit,
        Underline,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
      ])
    : '<p>No content yet.</p>'

  async function handleSign(data: { signerName: string; signerEmail: string; signatureData: string }) {
    const res = await fetch('/api/signatures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proposalId: proposal.id,
        signerName: data.signerName,
        signerEmail: data.signerEmail,
        signatureData: data.signatureData,
      }),
    })
    if (!res.ok) throw new Error('Failed to save signature')
    const { signature: newSig } = await res.json()
    setSignature(newSig)
  }

  const company = senderProfile?.company_name ?? 'ProposalFlow'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {senderProfile?.company_logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={senderProfile.company_logo_url} alt={company} className="h-8 object-contain" />
            ) : (
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="font-semibold text-gray-900">{company}</span>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Prepared for <strong className="text-gray-900">{proposal.client_name}</strong></p>
            <p>{formatDate(proposal.created_at)}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* Proposal title + amount (display only) */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">{proposal.title}</h1>
          {proposal.amount && (
            <p className="text-xl text-indigo-600 font-semibold mt-2">
              {formatCurrency(proposal.amount, proposal.currency)}
            </p>
          )}
        </div>

        {/* Proposal content */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div
            className="prose prose-gray max-w-none px-10 py-8"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>

        {/* Signature Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign this Proposal</h2>

          {signature ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-green-700 bg-green-50 rounded-xl p-4">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-semibold">Signed by {signature.signer_name}</p>
                  <p className="text-sm text-green-600">{formatDate(signature.signed_at)}</p>
                </div>
              </div>
              {signature.signature_data && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={signature.signature_data}
                  alt="Signature"
                  className="h-16 border border-gray-200 rounded-lg p-2 bg-white"
                />
              )}
            </div>
          ) : (
            <>
              <p className="text-gray-500 text-sm mb-6">
                By signing below, you confirm that you have read and agree to the terms of this proposal.
              </p>
              <SignaturePad onSign={handleSign} />
            </>
          )}
        </div>

        <footer className="text-center text-xs text-gray-400 pb-6">
          <p>This proposal was created with ProposalFlow · Secure · Encrypted</p>
        </footer>
      </main>
    </div>
  )
}
