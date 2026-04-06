'use client'

import { useState } from 'react'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { SignaturePad } from '@/components/proposal/signature-pad'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Proposal, Signature, Profile } from '@/lib/types'
import { CheckCircle, Download, Phone, Globe } from 'lucide-react'

interface Props {
  proposal: Proposal
  signature: Signature | null
  senderProfile: Profile | null
}

export function ClientProposalView({ proposal, signature: initialSig, senderProfile }: Props) {
  const [signature, setSignature] = useState<Signature | null>(initialSig)

  const brand     = senderProfile?.brand_color ?? '#4A3800'
  const company   = senderProfile?.company_name ?? 'ProposalFlow'
  const senderName = senderProfile?.full_name ?? company
  const refNo     = `REF-${proposal.id.slice(0, 8).toUpperCase()}`
  const issueDate = formatDate(proposal.created_at)
  const validUntil = proposal.expires_at ? formatDate(proposal.expires_at) : 'Open'

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

  // Summary rows for the agreement table
  const summaryRows = [
    ['Proposal Title',  proposal.title],
    ['Reference No.',   refNo],
    ...(proposal.amount ? [['Total Value', formatCurrency(proposal.amount, proposal.currency)]] : []),
    ['Date of Issue',   issueDate],
    ['Valid Until',     validUntil],
    ...(proposal.client_name ? [['Prepared For', proposal.client_name]] : []),
  ]

  return (
    <div
      className="min-h-screen proposal-client"
      // CSS variable lets globals.css use the brand colour inside .proposal-content
      style={{ '--proposal-brand': brand } as React.CSSProperties}
    >

      {/* ═══════════════════════════════════════════
          COVER PAGE
      ═══════════════════════════════════════════ */}
      <div className="proposal-cover relative overflow-hidden" style={{ backgroundColor: brand }}>

        {/* Decorative background circles */}
        <div className="cover-circle cover-circle-top" />
        <div className="cover-circle cover-circle-bottom" />

        {/* Top navigation bar */}
        <div className="cover-topbar relative z-10 no-print">
          {/* left: logo + company */}
          <div className="flex items-center gap-4">
            {senderProfile?.company_logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={senderProfile.company_logo_url}
                alt={company}
                className="h-9 w-auto object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            ) : null}
            <div>
              <div className="cover-brand-name">{company}</div>
              {senderProfile?.company_website && (
                <div className="cover-brand-tagline">{senderProfile.company_website}</div>
              )}
            </div>
          </div>

          {/* right: download button */}
          <button onClick={() => window.print()} className="cover-download-btn">
            <Download style={{ width: 13, height: 13 }} />
            Download PDF
          </button>
        </div>

        {/* Print-only top bar */}
        <div className="cover-topbar-print print-only">
          <div className="cover-brand-name">{company}</div>
          <div className="cover-doc-label">Proposal Document</div>
        </div>

        {/* Cover body */}
        <div className="cover-body relative z-10">

          <div className="cover-eyebrow">Formal Proposal</div>

          <h1 className="cover-title">{proposal.title}</h1>

          {proposal.amount && (
            <div className="cover-amount">
              Total Investment: <span>{formatCurrency(proposal.amount, proposal.currency)}</span>
            </div>
          )}

          <div className="cover-divider" />

          {/* Metadata grid */}
          <div className="cover-meta-grid">
            <div className="cover-meta-item">
              <label>Prepared For</label>
              <div className="value">{proposal.client_name || '—'}</div>
            </div>
            <div className="cover-meta-item">
              <label>Date of Issue</label>
              <div className="value">{issueDate}</div>
            </div>
            <div className="cover-meta-item">
              <label>Reference No.</label>
              <div className="value">{refNo}</div>
            </div>
            <div className="cover-meta-item">
              <label>Valid Until</label>
              <div className="value">{validUntil}</div>
            </div>
            <div className="cover-meta-item">
              <label>Prepared By</label>
              <div className="value">{senderName}</div>
            </div>
            {senderProfile?.company_phone && (
              <div className="cover-meta-item">
                <label>Contact</label>
                <div className="value">{senderProfile.company_phone}</div>
              </div>
            )}
          </div>
        </div>

        {/* Cover bottom bar */}
        <div className="cover-bottom relative z-10">
          <div className="cover-prepared-by">
            Prepared by <strong>{senderName}</strong>
            {senderProfile?.company_phone && (
              <span> · {senderProfile.company_phone}</span>
            )}
          </div>
          <div className="cover-confidential">Confidential</div>
        </div>

        {/* 5-colour brand bar at bottom of cover */}
        <div className="cover-color-bar">
          <span style={{ background: '#A84020' }} />
          <span style={{ background: '#E07A2A' }} />
          <span style={{ background: brand }} />
          <span style={{ background: '#3D6828' }} />
          <span style={{ background: '#2A7A8A' }} />
        </div>
      </div>


      {/* ═══════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════ */}
      <div className="proposal-body">

        {/* Page header — visible on print pages 2+ */}
        <div className="print-page-header print-only">
          <div className="print-header-brand">{company}</div>
          <div className="print-header-right">{proposal.title}<br />Ref: {refNo}</div>
        </div>

        {/* Proposal body content */}
        <div className="content-card">
          <div className="content-card-accent" style={{ backgroundColor: brand }} />
          <div
            className="proposal-content"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>


        {/* ─── SIGNATURE SECTION ─────────────────────── */}
        <div className="content-card signature-section">
          <div className="content-card-accent" style={{ backgroundColor: brand }} />
          <div className="content-card-body">

            {/* Section heading */}
            <div className="section-heading" style={{ borderLeftColor: brand }}>
              <div className="section-eyebrow" style={{ color: brand }}>Acceptance</div>
              <h2 className="section-h2">Acceptance &amp; Signatures</h2>
            </div>

            <p className="section-intro">
              By signing below, both parties confirm they have read, understood, and agree to the
              scope, terms, and conditions set forth in this proposal. This document, once signed
              by both parties, constitutes a binding agreement.
            </p>

            {/* Agreement summary table */}
            <div className="agreement-table-wrap">
              <table className="agreement-table">
                <tbody>
                  {summaryRows.map(([label, value], i) => (
                    <tr key={label} style={{ backgroundColor: i % 2 === 0 ? '#faf7f0' : '#ffffff' }}>
                      <td className="agreement-label" style={{ color: brand }}>{label}</td>
                      <td className="agreement-value">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Callout / next-steps banner */}
            {!signature && (
              <div className="callout-box no-print" style={{ borderLeftColor: brand, backgroundColor: `${brand}0d` }}>
                <strong>Next steps:</strong> Review this proposal and sign below to proceed.
                Your signature confirms agreement to the terms and scope described above.
              </div>
            )}

            {/* Two-column signature grid */}
            <div className="signature-grid">

              {/* Left — sender */}
              <div className="sig-block">
                <div className="sig-label">For and on behalf of {company}</div>
                <div className="sig-line" />
                <div className="sig-name">{senderName}</div>
                <div className="sig-role">Authorized Representative</div>
                <div style={{ marginTop: '16px' }}>
                  <div className="sig-label" style={{ marginBottom: '40px' }}>Date</div>
                  <div className="sig-line" />
                </div>
              </div>

              {/* Right — client */}
              <div className="sig-block">
                <div className="sig-label">For and on behalf of {proposal.client_name || 'the Client'}</div>

                {signature ? (
                  <>
                    <div
                      className="signed-badge"
                      style={{ backgroundColor: `${brand}18`, color: brand }}
                    >
                      <CheckCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
                      <div>
                        <p className="signed-name">Signed by {signature.signer_name}</p>
                        <p className="signed-date">{formatDate(signature.signed_at)}</p>
                      </div>
                    </div>
                    {signature.signature_data && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={signature.signature_data}
                        alt="Client signature"
                        className="signature-image"
                      />
                    )}
                  </>
                ) : (
                  <div className="no-print" style={{ marginTop: '12px' }}>
                    <SignaturePad onSign={handleSign} brandColor={brand} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>


        {/* ─── CONTACT FOOTER ────────────────────────── */}
        <div className="contact-footer" style={{ backgroundColor: brand }}>
          <div>
            <div className="footer-company">{company}</div>
            {senderProfile?.company_address && (
              <div className="footer-sub">{senderProfile.company_address}</div>
            )}
          </div>

          {senderProfile?.company_phone && (
            <div className="footer-contact-item">
              <div className="footer-contact-label">
                <Phone style={{ width: 10, height: 10 }} /> Phone
              </div>
              <div className="footer-contact-value">{senderProfile.company_phone}</div>
            </div>
          )}

          {senderProfile?.company_website && (
            <div className="footer-contact-item">
              <div className="footer-contact-label">
                <Globe style={{ width: 10, height: 10 }} /> Website
              </div>
              <div className="footer-contact-value">{senderProfile.company_website}</div>
            </div>
          )}

          <div className="footer-right">
            <div className="footer-tagline">Document generated</div>
            <div className="footer-date">{issueDate}</div>
          </div>
        </div>

      </div>
    </div>
  )
}
