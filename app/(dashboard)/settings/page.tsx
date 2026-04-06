'use client'

import { useEffect, useState } from 'react'
import { HexColorPicker, HexColorInput } from 'react-colorful'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, Loader2, Upload } from 'lucide-react'
import type { Profile } from '@/lib/types'

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [brandColor, setBrandColor] = useState('#4f46e5')
  const [customDomain, setCustomDomain] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserEmail(user.email ?? '')
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        if (data) {
          setProfile(data)
          setFullName(data.full_name ?? '')
          setCompanyName(data.company_name ?? '')
          setCompanyAddress(data.company_address ?? '')
          setCompanyPhone(data.company_phone ?? '')
          setCompanyWebsite(data.company_website ?? '')
          setBrandColor(data.brand_color ?? '#4f46e5')
          setCustomDomain(data.custom_domain ?? '')
        }
      })
    })
  }, [])

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('profiles').update({
      full_name: fullName,
      company_name: companyName,
      company_address: companyAddress,
      company_phone: companyPhone,
      company_website: companyWebsite,
      brand_color: brandColor,
      custom_domain: customDomain.trim() || null,
    }).eq('id', profile.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${profile.id}/logo.${ext}`
    const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path)
      await supabase.from('profiles').update({ company_logo_url: publicUrl }).eq('id', profile.id)
      setProfile(p => p ? { ...p, company_logo_url: publicUrl } : p)
    }
    setUploading(false)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-gray-500 mb-8">Your company details appear on every client proposal</p>

      <div className="space-y-6">

        {/* Logo */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Company Logo</h2>
          <div className="flex items-center gap-4">
            {profile?.company_logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.company_logo_url} alt="Logo" className="h-16 w-16 object-contain border border-gray-200 rounded-lg p-1" />
            ) : (
              <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-xs text-center">No logo</span>
              </div>
            )}
            <div>
              <label className="cursor-pointer">
                <span className="inline-flex items-center gap-2 bg-white border border-gray-300 text-sm text-gray-700 font-medium rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Uploading…' : 'Upload Logo'}
                </span>
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </label>
              <p className="text-xs text-gray-400 mt-1.5">PNG, JPG, SVG. Shown on all client proposals.</p>
            </div>
          </div>
        </div>

        {/* Brand color */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Brand Color</h2>
          <p className="text-sm text-gray-500 mb-5">Pick any color — it appears on your client proposal pages</p>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="shrink-0">
              <HexColorPicker color={brandColor} onChange={setBrandColor} />
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div
                className="w-full h-24 rounded-xl border border-gray-200 shadow-inner transition-colors duration-150"
                style={{ backgroundColor: brandColor }}
              />

              <div className="space-y-1.5">
                <Label>Hex Code</Label>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md border border-gray-200 shrink-0" style={{ backgroundColor: brandColor }} />
                  <div className="flex items-center border border-gray-300 rounded-md overflow-hidden flex-1">
                    <span className="px-2 text-gray-400 text-sm">#</span>
                    <HexColorInput
                      color={brandColor}
                      onChange={setBrandColor}
                      prefixed={false}
                      className="flex-1 py-2 pr-3 text-sm text-gray-900 outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Quick Presets</Label>
                <div className="flex gap-2 flex-wrap">
                  {(() => {
                    const lowerBrand = brandColor.toLowerCase()
                    return [
                      { color: '#4f46e5', name: 'Indigo' },
                      { color: '#0ea5e9', name: 'Sky' },
                      { color: '#10b981', name: 'Emerald' },
                      { color: '#f59e0b', name: 'Amber' },
                      { color: '#ef4444', name: 'Red' },
                      { color: '#8b5cf6', name: 'Violet' },
                      { color: '#ec4899', name: 'Pink' },
                      { color: '#f97316', name: 'Orange' },
                      { color: '#06b6d4', name: 'Cyan' },
                      { color: '#1e293b', name: 'Slate' },
                      { color: '#15803d', name: 'Green' },
                      { color: '#b45309', name: 'Brown' },
                    ].map(({ color, name }) => (
                      <button
                        key={color}
                        onClick={() => setBrandColor(color)}
                        title={name}
                        className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-125 focus:outline-none"
                        style={{
                          backgroundColor: color,
                          borderColor: lowerBrand === color ? '#111' : 'transparent',
                          boxShadow: lowerBrand === color ? '0 0 0 1px #fff inset' : 'none',
                        }}
                      />
                    ))
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Company Details</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Your Full Name</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Daniel Bangura" />
            </div>
            <div className="space-y-1.5">
              <Label>Company Name</Label>
              <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Nexa-Flow" />
            </div>
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} placeholder="Freetown, Sierra Leone" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} placeholder="+232 78 687 787" />
              </div>
              <div className="space-y-1.5">
                <Label>Website</Label>
                <Input value={companyWebsite} onChange={e => setCompanyWebsite(e.target.value)} placeholder="nexaflow.io" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email Address</Label>
              <Input value={userEmail} disabled className="bg-gray-50 text-gray-500" />
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="mt-5">
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : saved ? <><Check className="w-4 h-4 mr-2" />Saved!</> : 'Save Changes'}
          </Button>
        </div>

        {/* Custom domain */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Custom Domain</h2>
          <p className="text-sm text-gray-500 mb-4">Proposal links will use your domain instead of the default URL</p>
          <div className="space-y-1.5">
            <Label>Domain</Label>
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <span className="px-3 py-2 text-sm text-gray-400 bg-gray-50 border-r border-gray-300">https://</span>
              <Input
                value={customDomain}
                onChange={e => setCustomDomain(e.target.value)}
                placeholder="proposals.yourcompany.com"
                className="border-0 rounded-none focus-visible:ring-0"
              />
            </div>
          </div>
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4 text-xs text-blue-700 space-y-1">
            <p className="font-semibold">DNS Setup Instructions</p>
            <p>1. Go to your domain registrar (e.g. Namecheap, GoDaddy)</p>
            <p>2. Add a CNAME record: <code className="bg-blue-100 px-1 rounded">proposals</code> → <code className="bg-blue-100 px-1 rounded">cname.vercel-dns.com</code></p>
            <p>3. In Vercel: Project → Settings → Domains → add your domain</p>
            <p>4. Save this page once DNS is verified</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="mt-4">
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : saved ? <><Check className="w-4 h-4 mr-2" />Saved!</> : 'Save Domain'}
          </Button>
        </div>

      </div>
    </div>
  )
}
