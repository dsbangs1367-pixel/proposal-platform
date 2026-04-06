'use client'

import { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, RotateCcw } from 'lucide-react'

interface SignaturePadProps {
  onSign: (data: { signerName: string; signerEmail: string; signatureData: string }) => Promise<void>
  brandColor?: string
}

export function SignaturePad({ onSign, brandColor = '#4f46e5' }: SignaturePadProps) {
  const canvasRef = useRef<SignatureCanvas>(null)
  const [signerName, setSignerName] = useState('')
  const [signerEmail, setSignerEmail] = useState('')
  const [isEmpty, setIsEmpty] = useState(true)
  const [signing, setSigning] = useState(false)
  const [error, setError] = useState('')

  function handleClear() {
    canvasRef.current?.clear()
    setIsEmpty(true)
  }

  async function handleSign() {
    if (!signerName) { setError('Please enter your full name.'); return }
    if (!signerEmail) { setError('Please enter your email address.'); return }
    if (isEmpty || canvasRef.current?.isEmpty()) { setError('Please draw your signature above.'); return }
    setError('')
    setSigning(true)
    const signatureData = canvasRef.current!.toDataURL('image/png')
    try {
      await onSign({ signerName, signerEmail, signatureData })
    } catch {
      setError('Failed to save signature. Please try again.')
      setSigning(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="signer-name">Your Full Name *</Label>
          <Input
            id="signer-name"
            placeholder="John Smith"
            value={signerName}
            onChange={e => setSignerName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="signer-email">Your Email *</Label>
          <Input
            id="signer-email"
            type="email"
            placeholder="you@organization.com"
            value={signerEmail}
            onChange={e => setSignerEmail(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Draw Your Signature *</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white hover:border-indigo-300 transition-colors">
          <SignatureCanvas
            ref={canvasRef}
            penColor="#1a1a2e"
            canvasProps={{
              width: 600,
              height: 160,
              className: 'w-full',
              style: { touchAction: 'none' },
            }}
            onBegin={() => setIsEmpty(false)}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">Use your mouse or finger to draw your signature</p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Clear signature
        </button>
        <button
          type="button"
          onClick={handleSign}
          disabled={signing}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-50"
          style={{ backgroundColor: brandColor }}
        >
          {signing ? 'Saving…' : <><CheckCircle className="w-4 h-4" />Sign & Accept Proposal</>}
        </button>
      </div>
    </div>
  )
}
