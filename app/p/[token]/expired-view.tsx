import { FileX, MapPin, Phone, Globe, FileText } from 'lucide-react'
import type { Proposal, Profile } from '@/lib/types'

interface Props {
  proposal: Proposal
  senderProfile: Profile | null
}

export function ExpiredView({ proposal, senderProfile }: Props) {
  const brand = senderProfile?.brand_color ?? '#4f46e5'
  const company = senderProfile?.company_name ?? 'ProposalFlow'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-1.5 w-full" style={{ backgroundColor: brand }} />

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-8 py-6 flex items-center gap-4">
          {senderProfile?.company_logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={senderProfile.company_logo_url} alt={company} className="h-12 w-auto object-contain" />
          ) : (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: brand }}>
              <FileText className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-gray-900">{company}</h2>
            {senderProfile?.company_address && (
              <p className="text-sm text-gray-500">{senderProfile.company_address}</p>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileX className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">This proposal has expired</h1>
          <p className="text-gray-500 mb-2">
            <strong className="text-gray-700">{proposal.title}</strong> — prepared for {proposal.client_name}
          </p>
          <p className="text-gray-400 text-sm">
            This proposal is no longer accepting signatures. Please contact {company} to request an updated version.
          </p>

          {(senderProfile?.company_phone || senderProfile?.company_website) && (
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
              {senderProfile.company_phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  {senderProfile.company_phone}
                </div>
              )}
              {senderProfile.company_website && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  {senderProfile.company_website}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <div className="h-1.5 w-full mt-8" style={{ backgroundColor: brand }} />
    </div>
  )
}
