/**
 * DIG-11 security-hardening tests
 * Covers: app/api/signatures/route.ts
 *         app/api/payments/initialize/route.ts
 *         app/api/payments/webhook/route.ts
 *
 * All Supabase / email / flutterwave / next/headers calls are mocked.
 * The SQL migration (004_rls_hardening.sql) and the RPCs
 * (get_public_proposal / mark_proposal_viewed) are NOT tested here —
 * that surface requires a live Postgres instance.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// ---- Supabase chainable mock factory ----------------------------------------
// ---------------------------------------------------------------------------

/**
 * Build a minimal chainable Supabase mock.
 *
 * Each `from()` call returns a builder whose terminal methods
 * (single / maybeSingle / insert) return the responses configured
 * via `setResponse(table, method, result)`.
 */
function makeSupabaseMock() {
  // Map of  table -> method -> resolved value
  const responses: Record<string, Record<string, unknown>> = {}

  const mock = {
    // Configure what a terminal method returns for a given table
    setResponse(table: string, method: string, value: unknown) {
      if (!responses[table]) responses[table] = {}
      responses[table][method] = value
    },

    // Recorded calls for assertions
    calls: [] as Array<{ table: string; op: string; args: unknown[] }>,

    auth: {
      admin: {
        getUserById: vi.fn(),
      },
    },

    from(table: string) {
      const builder = {
        _table: table,
        _op: 'unknown',
        select: (_cols?: string) => { builder._op = 'select'; return builder },
        insert: (data: unknown) => {
          mock.calls.push({ table, op: 'insert', args: [data] })
          builder._op = 'insert'
          return builder
        },
        update: (data: unknown) => {
          mock.calls.push({ table, op: 'update', args: [data] })
          builder._op = 'update'
          return builder
        },
        eq: (_col: string, _val: unknown) => builder,
        in: (_col: string, _vals: unknown[]) => builder,
        single: () => Promise.resolve(responses[table]?.['single'] ?? { data: null, error: null }),
        maybeSingle: () => Promise.resolve(responses[table]?.['maybeSingle'] ?? { data: null }),
      }
      return builder
    },
  }

  return mock
}

// ---------------------------------------------------------------------------
// ---- Module mocks ----------------------------------------------------------
// ---------------------------------------------------------------------------

// next/headers
const mockHeaders = vi.fn()
vi.mock('next/headers', () => ({
  headers: mockHeaders,
}))

// lib/supabase/server
const mockCreateServiceClient = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: mockCreateServiceClient,
  createClient: vi.fn(),
}))

// lib/email
const mockSendSignedNotification = vi.fn()
const mockSendPaidNotification = vi.fn()
vi.mock('@/lib/email', () => ({
  sendSignedNotification: mockSendSignedNotification,
  sendPaidNotification: mockSendPaidNotification,
  sendProposalToClient: vi.fn(),
  sendViewedNotification: vi.fn(),
  sendTeamInvite: vi.fn(),
}))

// lib/flutterwave
const mockCreatePaymentLink = vi.fn()
vi.mock('@/lib/flutterwave', () => ({
  createPaymentLink: mockCreatePaymentLink,
  verifyFlutterwaveSignature: vi.fn(),
}))

// ---------------------------------------------------------------------------
// ---- Helpers ---------------------------------------------------------------
// ---------------------------------------------------------------------------

function jsonRequest(body: unknown, extraHeaders: Record<string, string> = {}) {
  return new NextRequest('http://localhost/api/test', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  })
}

function textRequest(body: string, extraHeaders: Record<string, string> = {}) {
  return new NextRequest('http://localhost/api/test', {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  })
}

// A minimal Headers-like object accepted by the route's `await headers()` call
function makeHeadersList(entries: Record<string, string | null> = {}) {
  return {
    get: (key: string) => entries[key] ?? null,
  }
}

// ---------------------------------------------------------------------------
// ---- Imports (after mocks) -------------------------------------------------
// ---------------------------------------------------------------------------

// Dynamic imports so mocks are wired before module evaluation
const getSignaturesRoute = () => import('../signatures/route')
const getPaymentsInitRoute = () => import('../payments/initialize/route')
const getPaymentsWebhookRoute = () => import('../payments/webhook/route')

// ---------------------------------------------------------------------------
// ===========================================================================
// SIGNATURES ROUTE  —  POST /api/signatures
// ===========================================================================
// ---------------------------------------------------------------------------

describe('POST /api/signatures', () => {
  let supabase: ReturnType<typeof makeSupabaseMock>

  const VALID_PROPOSAL = {
    id: 'prop-123',
    title: 'Test Proposal',
    user_id: 'user-456',
    status: 'sent',
    expires_at: new Date(Date.now() + 86_400_000).toISOString(), // tomorrow
    profiles: { full_name: 'Owner Name' },
  }

  const VALID_SIGNATURE = {
    id: 'sig-789',
    proposal_id: 'prop-123',
    signer_name: 'Alice',
    signed_at: new Date().toISOString(),
    signature_data: 'data:image/png;base64,abc',
  }

  beforeEach(() => {
    vi.resetModules()
    supabase = makeSupabaseMock()

    // Default: headers return no IP
    mockHeaders.mockResolvedValue(makeHeadersList())

    // Default: proposal found and signable
    supabase.setResponse('proposals', 'single', { data: VALID_PROPOSAL, error: null })
    supabase.setResponse('proposals', 'maybeSingle', { data: { id: 'prop-123' } })
    supabase.setResponse('signatures', 'single', { data: VALID_SIGNATURE, error: null })

    supabase.auth.admin.getUserById.mockResolvedValue({
      data: { user: { email: 'owner@example.com' } },
    })

    mockCreateServiceClient.mockResolvedValue(supabase)
    mockSendSignedNotification.mockResolvedValue(undefined)
  })

  // --- 400 -------------------------------------------------------------------

  it('400 when token is missing', async () => {
    const { POST } = await getSignaturesRoute()
    const res = await POST(jsonRequest({ signerName: 'Alice', signerEmail: 'a@b.com', signatureData: 'data' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/missing/i)
  })

  it('400 when signerName is missing', async () => {
    const { POST } = await getSignaturesRoute()
    const res = await POST(jsonRequest({ token: 'tok', signerEmail: 'a@b.com', signatureData: 'data' }))
    expect(res.status).toBe(400)
  })

  it('400 when signerEmail is missing', async () => {
    const { POST } = await getSignaturesRoute()
    const res = await POST(jsonRequest({ token: 'tok', signerName: 'Alice', signatureData: 'data' }))
    expect(res.status).toBe(400)
  })

  it('400 when signatureData is missing', async () => {
    const { POST } = await getSignaturesRoute()
    const res = await POST(jsonRequest({ token: 'tok', signerName: 'Alice', signerEmail: 'a@b.com' }))
    expect(res.status).toBe(400)
  })

  // --- 404 -------------------------------------------------------------------

  it('404 when proposal is not found for given token', async () => {
    supabase.setResponse('proposals', 'single', { data: null, error: null })
    const { POST } = await getSignaturesRoute()
    const res = await POST(jsonRequest({ token: 'bad-token', signerName: 'Alice', signerEmail: 'a@b.com', signatureData: 'data' }))
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toMatch(/not found/i)
  })

  // --- 409 status guard ------------------------------------------------------

  it('409 when proposal.status is "draft"', async () => {
    supabase.setResponse('proposals', 'single', { data: { ...VALID_PROPOSAL, status: 'draft' }, error: null })
    const { POST } = await getSignaturesRoute()
    const res = await POST(jsonRequest({ token: 'tok', signerName: 'Alice', signerEmail: 'a@b.com', signatureData: 'data' }))
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.error).toMatch(/not open for signing/i)
  })

  it('409 when proposal.status is "signed"', async () => {
    supabase.setResponse('proposals', 'single', { data: { ...VALID_PROPOSAL, status: 'signed' }, error: null })
    const { POST } = await getSignaturesRoute()
    const res = await POST(jsonRequest({ token: 'tok', signerName: 'Alice', signerEmail: 'a@b.com', signatureData: 'data' }))
    expect(res.status).toBe(409)
  })

  it('409 when proposal.status is "paid"', async () => {
    supabase.setResponse('proposals', 'single', { data: { ...VALID_PROPOSAL, status: 'paid' }, error: null })
    const { POST } = await getSignaturesRoute()
    const res = await POST(jsonRequest({ token: 'tok', signerName: 'Alice', signerEmail: 'a@b.com', signatureData: 'data' }))
    expect(res.status).toBe(409)
  })

  // --- 409 expiry guard ------------------------------------------------------

  it('409 when proposal has expired', async () => {
    supabase.setResponse('proposals', 'single', {
      data: { ...VALID_PROPOSAL, expires_at: new Date(Date.now() - 1000).toISOString() },
      error: null,
    })
    const { POST } = await getSignaturesRoute()
    const res = await POST(jsonRequest({ token: 'tok', signerName: 'Alice', signerEmail: 'a@b.com', signatureData: 'data' }))
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.error).toMatch(/expired/i)
  })

  // --- 409 race / CAS --------------------------------------------------------

  it('409 when compare-and-set returns null (concurrent race lost)', async () => {
    // single() returns a valid proposal but maybeSingle() (the update CAS) returns null
    supabase.setResponse('proposals', 'maybeSingle', { data: null })
    const { POST } = await getSignaturesRoute()
    const res = await POST(jsonRequest({ token: 'tok', signerName: 'Alice', signerEmail: 'a@b.com', signatureData: 'data' }))
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.error).toMatch(/not open for signing/i)
  })

  // --- happy path ------------------------------------------------------------

  it('200 happy path: returns signature without signer_email or ip_address', async () => {
    const { POST } = await getSignaturesRoute()
    const res = await POST(jsonRequest({
      token: 'valid-token',
      signerName: 'Alice',
      signerEmail: 'alice@example.com',
      signatureData: 'data:image/png;base64,abc',
    }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.signature).toBeDefined()
    // These fields must NOT be exposed
    expect(body.signature.signer_email).toBeUndefined()
    expect(body.signature.ip_address).toBeUndefined()
    // These fields should be present (from the mocked select)
    expect(body.signature.id).toBe('sig-789')
    expect(body.signature.signer_name).toBe('Alice')
  })

  it('200 happy path: proposal with no expiry still signs', async () => {
    supabase.setResponse('proposals', 'single', { data: { ...VALID_PROPOSAL, expires_at: null }, error: null })
    const { POST } = await getSignaturesRoute()
    const res = await POST(jsonRequest({
      token: 'valid-token',
      signerName: 'Alice',
      signerEmail: 'alice@example.com',
      signatureData: 'data:image/png;base64,abc',
    }))
    expect(res.status).toBe(200)
  })

  it('200 happy path: status "viewed" is also signable', async () => {
    supabase.setResponse('proposals', 'single', { data: { ...VALID_PROPOSAL, status: 'viewed' }, error: null })
    const { POST } = await getSignaturesRoute()
    const res = await POST(jsonRequest({
      token: 'valid-token',
      signerName: 'Alice',
      signerEmail: 'alice@example.com',
      signatureData: 'data:image/png;base64,abc',
    }))
    expect(res.status).toBe(200)
  })
})

// ---------------------------------------------------------------------------
// ===========================================================================
// PAYMENTS INITIALIZE ROUTE  —  POST /api/payments/initialize
// ===========================================================================
// ---------------------------------------------------------------------------

describe('POST /api/payments/initialize', () => {
  let supabase: ReturnType<typeof makeSupabaseMock>

  const VALID_PROPOSAL = {
    id: 'prop-123',
    public_token: 'tok-abc',
    amount: 500,
    currency: 'USD',
    status: 'signed',
    expires_at: new Date(Date.now() + 86_400_000).toISOString(),
    title: 'Design Services',
  }

  beforeEach(() => {
    vi.resetModules()
    supabase = makeSupabaseMock()

    supabase.setResponse('proposals', 'single', { data: VALID_PROPOSAL, error: null })
    // insert into payments returns nothing special
    mockCreateServiceClient.mockResolvedValue(supabase)
    mockCreatePaymentLink.mockResolvedValue('https://pay.flutterwave.com/pay/test123')

    process.env.NEXT_PUBLIC_APP_URL = 'https://app.example.com'
  })

  // --- 400 -------------------------------------------------------------------

  it('400 when token is missing', async () => {
    const { POST } = await getPaymentsInitRoute()
    const res = await POST(jsonRequest({ customerEmail: 'c@e.com', customerName: 'Bob' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/missing token/i)
  })

  // --- 404 -------------------------------------------------------------------

  it('404 when proposal is not found', async () => {
    supabase.setResponse('proposals', 'single', { data: null, error: null })
    const { POST } = await getPaymentsInitRoute()
    const res = await POST(jsonRequest({ token: 'bad-token' }))
    expect(res.status).toBe(404)
  })

  it('404 when proposal.amount is falsy (zero)', async () => {
    supabase.setResponse('proposals', 'single', { data: { ...VALID_PROPOSAL, amount: 0 }, error: null })
    const { POST } = await getPaymentsInitRoute()
    const res = await POST(jsonRequest({ token: 'tok', customerEmail: 'c@e.com' }))
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toMatch(/not found/i)
  })

  it('404 when proposal.amount is null', async () => {
    supabase.setResponse('proposals', 'single', { data: { ...VALID_PROPOSAL, amount: null }, error: null })
    const { POST } = await getPaymentsInitRoute()
    const res = await POST(jsonRequest({ token: 'tok' }))
    expect(res.status).toBe(404)
  })

  // --- 409 status guard ------------------------------------------------------

  it('409 when proposal.status is "draft"', async () => {
    supabase.setResponse('proposals', 'single', { data: { ...VALID_PROPOSAL, status: 'draft' }, error: null })
    const { POST } = await getPaymentsInitRoute()
    const res = await POST(jsonRequest({ token: 'tok', customerEmail: 'c@e.com', customerName: 'Bob' }))
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.error).toMatch(/not open for payment/i)
  })

  it('409 when proposal.status is "paid"', async () => {
    supabase.setResponse('proposals', 'single', { data: { ...VALID_PROPOSAL, status: 'paid' }, error: null })
    const { POST } = await getPaymentsInitRoute()
    const res = await POST(jsonRequest({ token: 'tok', customerEmail: 'c@e.com', customerName: 'Bob' }))
    expect(res.status).toBe(409)
  })

  // --- 409 expiry guard ------------------------------------------------------

  it('409 when proposal has expired', async () => {
    supabase.setResponse('proposals', 'single', {
      data: { ...VALID_PROPOSAL, expires_at: new Date(Date.now() - 1000).toISOString() },
      error: null,
    })
    const { POST } = await getPaymentsInitRoute()
    const res = await POST(jsonRequest({ token: 'tok', customerEmail: 'c@e.com', customerName: 'Bob' }))
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.error).toMatch(/expired/i)
  })

  // --- happy path ------------------------------------------------------------

  it('200 happy path: returns paymentUrl', async () => {
    const { POST } = await getPaymentsInitRoute()
    const res = await POST(jsonRequest({
      token: 'tok-abc',
      customerEmail: 'customer@example.com',
      customerName: 'Bob',
    }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.paymentUrl).toBe('https://pay.flutterwave.com/pay/test123')
  })

  it('200 happy path: "sent" status is payable', async () => {
    supabase.setResponse('proposals', 'single', { data: { ...VALID_PROPOSAL, status: 'sent' }, error: null })
    const { POST } = await getPaymentsInitRoute()
    const res = await POST(jsonRequest({ token: 'tok', customerEmail: 'c@e.com', customerName: 'Bob' }))
    expect(res.status).toBe(200)
  })

  it('200 happy path: "viewed" status is payable', async () => {
    supabase.setResponse('proposals', 'single', { data: { ...VALID_PROPOSAL, status: 'viewed' }, error: null })
    const { POST } = await getPaymentsInitRoute()
    const res = await POST(jsonRequest({ token: 'tok', customerEmail: 'c@e.com', customerName: 'Bob' }))
    expect(res.status).toBe(200)
  })

  it('200 happy path: proposal with no expiry proceeds', async () => {
    supabase.setResponse('proposals', 'single', { data: { ...VALID_PROPOSAL, expires_at: null }, error: null })
    const { POST } = await getPaymentsInitRoute()
    const res = await POST(jsonRequest({ token: 'tok', customerEmail: 'c@e.com', customerName: 'Bob' }))
    expect(res.status).toBe(200)
  })
})

// ---------------------------------------------------------------------------
// ===========================================================================
// PAYMENTS WEBHOOK ROUTE  —  POST /api/payments/webhook
// ===========================================================================
// ---------------------------------------------------------------------------

describe('POST /api/payments/webhook', () => {
  let supabase: ReturnType<typeof makeSupabaseMock>

  const WEBHOOK_HASH = 'super-secret-hash'

  const VALID_PAYMENT = {
    id: 'pay-001',
    proposals: {
      id: 'prop-123',
      title: 'Design Services',
      user_id: 'user-456',
    },
  }

  const VALID_EVENT = {
    event: 'charge.completed',
    data: {
      status: 'successful',
      tx_ref: 'proposal-prop-123-1234567890',
      id: 9999,
      amount: 500,
      currency: 'USD',
    },
  }

  beforeEach(() => {
    vi.resetModules()
    supabase = makeSupabaseMock()

    process.env.FLUTTERWAVE_WEBHOOK_HASH = WEBHOOK_HASH

    supabase.setResponse('payments', 'single', { data: VALID_PAYMENT, error: null })
    supabase.setResponse('signatures', 'maybeSingle', { data: { signer_name: 'Alice' } })
    supabase.setResponse('profiles', 'single', { data: { full_name: 'Owner' }, error: null })

    supabase.auth.admin.getUserById.mockResolvedValue({
      data: { user: { email: 'owner@example.com' } },
    })

    mockCreateServiceClient.mockResolvedValue(supabase)
    mockSendPaidNotification.mockResolvedValue(undefined)
  })

  // --- 401 auth guard --------------------------------------------------------

  it('401 when verif-hash header is missing', async () => {
    const { POST } = await getPaymentsWebhookRoute()
    const res = await POST(textRequest(JSON.stringify(VALID_EVENT)))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toMatch(/invalid signature/i)
  })

  it('401 when verif-hash header does not match the env secret', async () => {
    const { POST } = await getPaymentsWebhookRoute()
    const res = await POST(textRequest(JSON.stringify(VALID_EVENT), { 'verif-hash': 'wrong-hash' }))
    expect(res.status).toBe(401)
  })

  it('401 when FLUTTERWAVE_WEBHOOK_HASH env var is unset', async () => {
    delete process.env.FLUTTERWAVE_WEBHOOK_HASH
    const { POST } = await getPaymentsWebhookRoute()
    const res = await POST(textRequest(JSON.stringify(VALID_EVENT), { 'verif-hash': WEBHOOK_HASH }))
    expect(res.status).toBe(401)
  })

  it('401 when hash matches but has wrong length (different-length inputs)', async () => {
    const { POST } = await getPaymentsWebhookRoute()
    const res = await POST(textRequest(JSON.stringify(VALID_EVENT), { 'verif-hash': WEBHOOK_HASH + 'extra' }))
    expect(res.status).toBe(401)
  })

  // --- happy path ------------------------------------------------------------

  it('200 and { received: true } for a valid charge.completed event', async () => {
    const { POST } = await getPaymentsWebhookRoute()
    const res = await POST(textRequest(JSON.stringify(VALID_EVENT), { 'verif-hash': WEBHOOK_HASH }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.received).toBe(true)
  })

  it('200 and { received: true } for an unrecognised event type (no DB writes)', async () => {
    const otherEvent = { event: 'transfer.completed', data: {} }
    const { POST } = await getPaymentsWebhookRoute()
    const res = await POST(textRequest(JSON.stringify(otherEvent), { 'verif-hash': WEBHOOK_HASH }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.received).toBe(true)
  })

  it('200 for charge.completed where status is not "successful" (no DB writes)', async () => {
    const pendingEvent = {
      event: 'charge.completed',
      data: { ...VALID_EVENT.data, status: 'pending' },
    }
    const { POST } = await getPaymentsWebhookRoute()
    const res = await POST(textRequest(JSON.stringify(pendingEvent), { 'verif-hash': WEBHOOK_HASH }))
    expect(res.status).toBe(200)
    expect((await res.json()).received).toBe(true)
  })

  it('200 even when payment record is not found (graceful no-op)', async () => {
    supabase.setResponse('payments', 'single', { data: null, error: null })
    const { POST } = await getPaymentsWebhookRoute()
    const res = await POST(textRequest(JSON.stringify(VALID_EVENT), { 'verif-hash': WEBHOOK_HASH }))
    expect(res.status).toBe(200)
    expect((await res.json()).received).toBe(true)
  })

  // --- constant-time compare edge case ---------------------------------------

  it('401 when hash is empty string (fails length check)', async () => {
    const { POST } = await getPaymentsWebhookRoute()
    const res = await POST(textRequest(JSON.stringify(VALID_EVENT), { 'verif-hash': '' }))
    expect(res.status).toBe(401)
  })
})
