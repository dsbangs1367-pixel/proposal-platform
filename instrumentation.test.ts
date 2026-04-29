import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock @sentry/nextjs BEFORE any dynamic imports
// ---------------------------------------------------------------------------
const mockInit = vi.fn()
const mockCaptureRequestError = vi.fn()

vi.mock('@sentry/nextjs', () => ({
  init: mockInit,
  captureRequestError: mockCaptureRequestError,
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Invoke register() with the given env overrides, then restore. */
async function callRegister(envOverrides: Record<string, string | undefined>) {
  const saved: Record<string, string | undefined> = {}
  for (const key of Object.keys(envOverrides)) {
    saved[key] = process.env[key]
    if (envOverrides[key] === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = envOverrides[key]
    }
  }

  // Re-import each time so module-level constants are re-evaluated.
  // For instrumentation.ts the public API is register() which reads env at
  // call time, so a single static import is sufficient — but we force-reset
  // modules to be safe.
  vi.resetModules()
  const mod = await import('./instrumentation')
  await mod.register()

  for (const key of Object.keys(saved)) {
    if (saved[key] === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = saved[key]
    }
  }

  return mod
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('instrumentation.ts — register()', () => {
  beforeEach(() => {
    mockInit.mockClear()
    // Ensure clean env baseline
    delete process.env.NEXT_RUNTIME
    delete process.env.SENTRY_DSN
    delete process.env.NEXT_PUBLIC_SENTRY_DSN
  })

  afterEach(() => {
    vi.resetModules()
  })

  // --- Runtime gating -------------------------------------------------------

  it('does NOT call Sentry.init when NEXT_RUNTIME is undefined', async () => {
    await callRegister({
      NEXT_RUNTIME: undefined,
      SENTRY_DSN: 'https://test@sentry.io/1',
    })
    expect(mockInit).not.toHaveBeenCalled()
  })

  it('does NOT call Sentry.init when NEXT_RUNTIME is "unknown"', async () => {
    await callRegister({
      NEXT_RUNTIME: 'unknown',
      SENTRY_DSN: 'https://test@sentry.io/1',
    })
    expect(mockInit).not.toHaveBeenCalled()
  })

  it('calls Sentry.init when NEXT_RUNTIME is "nodejs"', async () => {
    await callRegister({
      NEXT_RUNTIME: 'nodejs',
      SENTRY_DSN: 'https://test@sentry.io/1',
    })
    expect(mockInit).toHaveBeenCalledOnce()
  })

  it('calls Sentry.init when NEXT_RUNTIME is "edge"', async () => {
    await callRegister({
      NEXT_RUNTIME: 'edge',
      SENTRY_DSN: 'https://test@sentry.io/1',
    })
    expect(mockInit).toHaveBeenCalledOnce()
  })

  // --- DSN gating -----------------------------------------------------------

  it('does NOT call Sentry.init when DSN env vars are unset (even with NEXT_RUNTIME=nodejs)', async () => {
    await callRegister({
      NEXT_RUNTIME: 'nodejs',
      SENTRY_DSN: undefined,
      NEXT_PUBLIC_SENTRY_DSN: undefined,
    })
    expect(mockInit).not.toHaveBeenCalled()
  })

  // --- DSN source -----------------------------------------------------------

  it('uses SENTRY_DSN when both DSN vars are set', async () => {
    await callRegister({
      NEXT_RUNTIME: 'nodejs',
      SENTRY_DSN: 'https://primary@sentry.io/1',
      NEXT_PUBLIC_SENTRY_DSN: 'https://fallback@sentry.io/2',
    })
    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({ dsn: 'https://primary@sentry.io/1' }),
    )
  })

  it('falls back to NEXT_PUBLIC_SENTRY_DSN when SENTRY_DSN is absent', async () => {
    await callRegister({
      NEXT_RUNTIME: 'nodejs',
      SENTRY_DSN: undefined,
      NEXT_PUBLIC_SENTRY_DSN: 'https://public@sentry.io/3',
    })
    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({ dsn: 'https://public@sentry.io/3' }),
    )
  })

  // --- Init options ---------------------------------------------------------

  it('passes sendDefaultPii: false to Sentry.init', async () => {
    await callRegister({
      NEXT_RUNTIME: 'nodejs',
      SENTRY_DSN: 'https://test@sentry.io/1',
    })
    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({ sendDefaultPii: false }),
    )
  })

  it('passes tracesSampleRate: 0.1 to Sentry.init', async () => {
    await callRegister({
      NEXT_RUNTIME: 'nodejs',
      SENTRY_DSN: 'https://test@sentry.io/1',
    })
    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({ tracesSampleRate: 0.1 }),
    )
  })

  // --- beforeSend PII scrubbing ---------------------------------------------

  it('beforeSend strips user, breadcrumbs, request fields, and contexts.nextjs', async () => {
    await callRegister({
      NEXT_RUNTIME: 'nodejs',
      SENTRY_DSN: 'https://test@sentry.io/1',
    })

    const { beforeSend } = mockInit.mock.calls[0][0] as {
      beforeSend: (e: Record<string, unknown>) => Record<string, unknown>
    }

    const fakeEvent = {
      user: { id: 'u1', email: 'a@b.com' },
      breadcrumbs: [{ message: 'click' }],
      request: {
        url: 'https://example.com/secret',
        cookies: 'session=abc',
        data: { password: 'hunter2' },
        headers: { authorization: 'Bearer tok' },
        method: 'POST', // should remain
      },
      contexts: {
        nextjs: { route: '/dashboard' },
        runtime: { name: 'node' }, // should remain
      },
    }

    const result = beforeSend(fakeEvent) as typeof fakeEvent

    expect(result.user).toBeUndefined()
    expect(result.breadcrumbs).toBeUndefined()
    expect(result.request.url).toBeUndefined()
    expect(result.request.cookies).toBeUndefined()
    expect(result.request.data).toBeUndefined()
    expect(result.request.headers).toBeUndefined()
    // non-PII request field is preserved
    expect(result.request.method).toBe('POST')
    // contexts.nextjs stripped, other contexts intact
    expect(result.contexts.nextjs).toBeUndefined()
    expect((result.contexts as Record<string, unknown>).runtime).toBeDefined()
  })

  it('beforeSend handles missing optional fields gracefully', async () => {
    await callRegister({
      NEXT_RUNTIME: 'nodejs',
      SENTRY_DSN: 'https://test@sentry.io/1',
    })

    const { beforeSend } = mockInit.mock.calls[0][0] as {
      beforeSend: (e: Record<string, unknown>) => Record<string, unknown>
    }

    // No request, no contexts — must not throw
    const minimalEvent = { message: 'hello' }
    const result = beforeSend(minimalEvent)
    expect(result).toEqual({ message: 'hello' })
  })

  // --- beforeBreadcrumb -----------------------------------------------------

  it('beforeBreadcrumb returns null for category "console"', async () => {
    await callRegister({
      NEXT_RUNTIME: 'nodejs',
      SENTRY_DSN: 'https://test@sentry.io/1',
    })
    const { beforeBreadcrumb } = mockInit.mock.calls[0][0] as {
      beforeBreadcrumb: (b: { category?: string }) => null | { category?: string }
    }
    expect(beforeBreadcrumb({ category: 'console' })).toBeNull()
  })

  it('beforeBreadcrumb returns null for category "navigation"', async () => {
    await callRegister({
      NEXT_RUNTIME: 'nodejs',
      SENTRY_DSN: 'https://test@sentry.io/1',
    })
    const { beforeBreadcrumb } = mockInit.mock.calls[0][0] as {
      beforeBreadcrumb: (b: { category?: string }) => null | { category?: string }
    }
    expect(beforeBreadcrumb({ category: 'navigation' })).toBeNull()
  })

  it('beforeBreadcrumb passes through category "info"', async () => {
    await callRegister({
      NEXT_RUNTIME: 'nodejs',
      SENTRY_DSN: 'https://test@sentry.io/1',
    })
    const { beforeBreadcrumb } = mockInit.mock.calls[0][0] as {
      beforeBreadcrumb: (b: { category?: string }) => null | { category?: string }
    }
    const crumb = { category: 'info', message: 'loaded' }
    expect(beforeBreadcrumb(crumb)).toEqual(crumb)
  })

  it('beforeBreadcrumb passes through breadcrumb with no category', async () => {
    await callRegister({
      NEXT_RUNTIME: 'nodejs',
      SENTRY_DSN: 'https://test@sentry.io/1',
    })
    const { beforeBreadcrumb } = mockInit.mock.calls[0][0] as {
      beforeBreadcrumb: (b: { category?: string }) => null | { category?: string }
    }
    const crumb = { message: 'something happened' }
    expect(beforeBreadcrumb(crumb)).toEqual(crumb)
  })

  // --- onRequestError re-export check ---------------------------------------

  it('onRequestError is the same function as Sentry.captureRequestError', async () => {
    vi.resetModules()
    const mod = await import('./instrumentation')
    const sentry = await import('@sentry/nextjs')
    expect(mod.onRequestError).toBe(sentry.captureRequestError)
  })
})
