// Email sending is currently disabled.
// To re-enable: install resend, restore the implementations below,
// and set RESEND_API_KEY + RESEND_FROM_EMAIL in your environment.

export async function sendProposalToClient(_args: {
  clientEmail: string
  clientName: string
  senderCompany: string
  proposalTitle: string
  publicToken: string
  brandColor?: string
  baseUrl?: string
}) {}

export async function sendViewedNotification(_args: {
  ownerEmail: string
  ownerName: string
  clientName: string
  proposalTitle: string
  proposalId: string
}) {}

export async function sendSignedNotification(_args: {
  ownerEmail: string
  ownerName: string
  clientName: string
  proposalTitle: string
  proposalId: string
}) {}

export async function sendTeamInvite(_args: {
  inviteEmail: string
  inviterName: string
  teamName: string
  inviteToken: string
}) {}

export async function sendPaidNotification(_args: {
  ownerEmail: string
  ownerName: string
  clientName: string
  proposalTitle: string
  amount: number
  currency: string
  proposalId: string
}) {}
