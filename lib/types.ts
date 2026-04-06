export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'signed' | 'paid' | 'expired'

export interface Profile {
  id: string
  full_name: string | null
  company_name: string | null
  company_logo_url: string | null
  company_address: string | null
  company_phone: string | null
  company_website: string | null
  brand_color: string
  custom_domain: string | null
  plan: 'free' | 'pro'
  created_at: string
}

export interface Proposal {
  id: string
  user_id: string
  title: string
  client_name: string
  client_email: string
  content: object | null
  status: ProposalStatus
  amount: number | null
  currency: string
  public_token: string
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface Signature {
  id: string
  proposal_id: string
  signature_data: string
  signer_name: string
  signer_email: string
  signed_at: string
  ip_address: string | null
}

export interface Payment {
  id: string
  proposal_id: string
  flutterwave_tx_ref: string
  flutterwave_tx_id: string | null
  amount: number
  currency: string
  status: 'pending' | 'successful' | 'failed'
  paid_at: string | null
}

export interface Team {
  id: string
  name: string
  owner_id: string
  created_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string | null
  invite_email: string
  role: 'admin' | 'member'
  status: 'pending' | 'active'
  invite_token: string
  invited_at: string
  joined_at: string | null
}

export interface Template {
  id: string
  user_id: string | null
  name: string
  category: 'consulting' | 'digital_health' | 'grant' | 'services' | 'partnership'
  content: object
  is_public: boolean
}
