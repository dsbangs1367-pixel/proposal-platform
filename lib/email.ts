import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const FROM = 'onboarding@resend.dev'

export async function sendProposalToClient({
  clientEmail,
  clientName,
  senderCompany,
  proposalTitle,
  publicToken,
}: {
  clientEmail: string
  clientName: string
  senderCompany: string
  proposalTitle: string
  publicToken: string
}) {
  const link = `${APP_URL}/p/${publicToken}`
  await resend.emails.send({
    from: FROM,
    to: clientEmail,
    subject: `${senderCompany} sent you a proposal: ${proposalTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">You have a new proposal</h2>
        <p>Hi ${clientName},</p>
        <p><strong>${senderCompany}</strong> has sent you a proposal titled <strong>"${proposalTitle}"</strong>.</p>
        <p>Click the button below to view, sign, and pay.</p>
        <a href="${link}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;margin:16px 0;">
          View Proposal
        </a>
        <p style="color:#666;font-size:12px;">Or copy this link: ${link}</p>
      </div>
    `,
  })
}

export async function sendSignedNotification({
  ownerEmail,
  ownerName,
  clientName,
  proposalTitle,
  proposalId,
}: {
  ownerEmail: string
  ownerName: string
  clientName: string
  proposalTitle: string
  proposalId: string
}) {
  await resend.emails.send({
    from: FROM,
    to: ownerEmail,
    subject: `✅ ${clientName} signed your proposal`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color:#1a1a2e;">Proposal Signed</h2>
        <p>Hi ${ownerName},</p>
        <p><strong>${clientName}</strong> has signed your proposal <strong>"${proposalTitle}"</strong>.</p>
        <a href="${APP_URL}/proposals/${proposalId}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;margin:16px 0;">
          View Proposal
        </a>
      </div>
    `,
  })
}

export async function sendPaidNotification({
  ownerEmail,
  ownerName,
  clientName,
  proposalTitle,
  amount,
  currency,
  proposalId,
}: {
  ownerEmail: string
  ownerName: string
  clientName: string
  proposalTitle: string
  amount: number
  currency: string
  proposalId: string
}) {
  await resend.emails.send({
    from: FROM,
    to: ownerEmail,
    subject: `💰 Payment received for "${proposalTitle}"`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color:#1a1a2e;">Payment Received</h2>
        <p>Hi ${ownerName},</p>
        <p><strong>${clientName}</strong> has paid <strong>${currency} ${amount.toLocaleString()}</strong> for <strong>"${proposalTitle}"</strong>.</p>
        <a href="${APP_URL}/proposals/${proposalId}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;margin:16px 0;">
          View Proposal
        </a>
      </div>
    `,
  })
}
