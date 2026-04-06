'use client'

import { useState } from 'react'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { SignaturePad } from '@/components/proposal/signature-pad'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Proposal, Signature, Profile } from '@/lib/types'
import { CheckCircle, MapPin, Phone, Globe, FileText } from 'lucide-react'

interface Props {
  proposal: Proposal
  signature: Signature | null
  senderProfile: Profile | null
}

export function ClientProposalView({ proposal, signature: initialSig, senderProfile }: Props) {
  const [signature, setSignature] = useState<Signature | null>(initialSig)

  const brand = senderProfile?.brand_color ?? '#4f46e5'
  const company = senderProfile?.company_name ?? 'ProposalFlow'

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

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top brand bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: brand }} />

      {/* Company header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-8 py-6 flex items-start justify-between gap-6">
          {/* Logo + company name */}
          <div className="flex items-center gap-4">
            {senderProfile?.company_logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={senderProfile.company_logo_url}
                alt={company}
                className="h-14 w-auto object-contain"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: brand }}
              >
                <FileText className="w-7 h-7 text-white" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{company}</h2>
              {senderProfile?.company_address && (
                <p className="text-sm text-gray-500 mt-0.5">{senderProfile.company_address}</p>
              )}
            </div>
          </div>

          {/* Contact details */}
          <div className="text-right space-y-1 text-sm text-gray-500 shrink-0">
            {senderProfile?.company_phone && (
              <div className="flex items-center justify-end gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {senderProfile.company_phone}
              </div>
            )}
            {senderProfile?.company_website && (
              <div className="flex items-center justify-end gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                {senderProfile.company_website}
              </div>
            )}
          </div>
        </div>

        {/* Proposal meta bar */}
        <div className="max-w-4xl mx-auto px-8 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>Prepared for <strong className="text-gray-900">{proposal.client_name}</strong></span>
          <span>{formatDate(proposal.created_at)}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* Proposal title hero */}
        <div
          className="rounded-2xl px-10 py-10 text-white text-center"
          style={{ backgroundColor: brand }}
        >
          <p className="text-sm font-medium uppercase tracking-widest opacity-80 mb-2">Proposal</p>
          <h1 className="text-3xl font-bold leading-tight">{proposal.title}</h1>
          {proposal.amount && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-5 py-2">
              <span className="text-lg font-bold">
                {formatCurrency(proposal.amount, proposal.currency)}
              </span>
            </div>
          )}
        </div>

        {/* Proposal content */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Content header accent */}
          <div className="h-1 w-full" style={{ backgroundColor: brand }} />
          <div
            className="prose prose-gray max-w-none px-10 py-8
              prose-headings:text-gray-900
              prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4
              prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-3
              prose-h3:text-base prose-h3:font-semibold
              prose-p:text-gray-700 prose-p:leading-relaxed
              prose-li:text-gray-700
              prose-ul:my-3"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>

        {/* Signature Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-1 w-full" style={{ backgroundColor: brand }} />
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Sign this Proposal</h2>

            {signature ? (
              <div className="space-y-4 mt-4">
                <div
                  className="flex items-center gap-3 rounded-xl p-4"
                  style={{ backgroundColor: `${brand}15`, color: brand }}
                >
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-semibold">Signed by {signature.signer_name}</p>
                    <p className="text-sm opacity-80">{formatDate(signature.signed_at)}</p>
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
                <SignaturePad onSign={handleSign} brandColor={brand} />
              </>
            )}
          </div>
        </div>

        {/* Company footer */}
        <footer className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-1 w-full" style={{ backgroundColor: brand }} />
          <div className="px-8 py-6">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <p className="font-semibold text-gray-900 mb-2">{company}</p>
                <div className="space-y-1 text-sm text-gray-500">
                  {senderProfile?.company_address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {senderProfile.company_address}
                    </div>
                  )}
                  {senderProfile?.company_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      {senderProfile.company_phone}
                    </div>
                  )}
                  {senderProfile?.company_website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      {senderProfile.company_website}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right text-sm text-gray-400">
                <p>Document generated on {formatDate(proposal.created_at)}</p>
                <p className="mt-1">Powered by ProposalFlow</p>
              </div>
            </div>
          </div>
        </footer>

      </main>

      {/* Bottom brand bar */}
      <div className="h-1.5 w-full mt-8" style={{ backgroundColor: brand }} />
    </div>
  )
}
