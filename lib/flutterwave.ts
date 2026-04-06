const FLUTTERWAVE_BASE = 'https://api.flutterwave.com/v3'

interface PaymentLinkParams {
  txRef: string
  amount: number
  currency: string
  customerEmail: string
  customerName: string
  proposalTitle: string
  redirectUrl: string
}

export async function createPaymentLink(params: PaymentLinkParams): Promise<string> {
  const response = await fetch(`${FLUTTERWAVE_BASE}/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tx_ref: params.txRef,
      amount: params.amount,
      currency: params.currency,
      redirect_url: params.redirectUrl,
      customer: {
        email: params.customerEmail,
        name: params.customerName,
      },
      customizations: {
        title: 'Proposal Payment',
        description: params.proposalTitle,
        logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
      },
      payment_options: 'card,mobilemoney,banktransfer,ussd',
    }),
  })

  const data = await response.json()
  if (data.status !== 'success') {
    throw new Error(data.message || 'Failed to create payment link')
  }
  return data.data.link
}

export function verifyFlutterwaveSignature(
  secretHash: string,
  body: string,
  signature: string
): boolean {
  const crypto = require('crypto')
  const hash = crypto.createHmac('sha256', secretHash).update(body).digest('hex')
  return hash === signature
}
