'use client'

import { useEffect, useState } from 'react'
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
        }
      })
    })
  }, [])

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ full_name: fullName, company_name: companyName }).eq('id', profile.id)
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
      <p className="text-gray-500 mb-8">Manage your profile and company information</p>

      <div className="space-y-6">
        {/* Company logo */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Company Logo</h2>
          <div className="flex items-center gap-4">
            {profile?.company_logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.company_logo_url} alt="Logo" className="h-16 w-16 object-contain border border-gray-200 rounded-lg p-1" />
            ) : (
              <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-xs">No logo</span>
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
              <p className="text-xs text-gray-400 mt-1.5">PNG, JPG, SVG up to 2MB. Displayed on client proposals.</p>
            </div>
          </div>
        </div>

        {/* Profile info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
            </div>
            <div className="space-y-1.5">
              <Label>Company Name</Label>
              <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Your company or organization" />
            </div>
            <div className="space-y-1.5">
              <Label>Email Address</Label>
              <Input value={userEmail} disabled className="bg-gray-50 text-gray-500" />
              <p className="text-xs text-gray-400">Email cannot be changed here.</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="mt-5">
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : saved ? <><Check className="w-4 h-4 mr-2" />Saved!</> : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
