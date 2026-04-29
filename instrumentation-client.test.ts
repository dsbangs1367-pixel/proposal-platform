import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock @sentry/nextjs BEFORE any dynamic imports.
// We need captureRouterTransitionStart even though the CJS build doesn't
// export it at runtime — our mock supplies it consistently.
// ---------------------------------------------------------------------------
const mockInit = vi.fn()
const mockCaptureRouterTransitionStart = vi.fn()

vi.mock('@sentry/nextjs', () => ({
  init: mockInit,
  captureRouterTransitionStart: mockCaptureRouterTransitionStart,
}))

// ---------------------------------------------------------------------------
// Each test re-imports the module fresh so that the module-level `if (dsn)`
// block is re-evaluated with the current process.env.
// ---------------------------------------------------------------------------

describe('instrumentation-client.ts', () => {
  beforeEach(() => {
    mockInit.mockClear()
    delete process.env.NEXT_PUBLIC_SENTRY_DSN
    vi.resetModules()
  })

  // --- Module-level init gating ---------------------------------------------

  it('calls Sentry.init once when NEXT_PUBLIC_SENTRY_DSN is set', async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://client@sentry.io/1'
    await import('./instrumentation-client')
    expect(mockInit).toHaveBeenCalledOnce()
  })

  it('does NOT call Sentry.init when NEXT_PUBLIC_SENTRY_DSN is unset', async () => {
    delete process.env.NEXT_PUBLIC_SENTRY_DSN
    await import('./instrumentation-client')
    expect(mockInit).not.toHaveBeenCalled()
  })

  // --- Init options ---------------------------------------------------------

  it('passes defaultIntegrations: false to Sentry.init', async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://client@sentry.io/1'
    await import('./instrumentation-client')
    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({ defaultIntegrations: false }),
    )
  })

  it('passes integrations: [] to Sentry.init', async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://client@sentry.io/1'
    await import('./instrumentation-client')
    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({ integrations: [] }),
    )
  })

  it('passes sendDefaultPii: false to Sentry.init', async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://client@sentry.io/1'
    await import('./instrumentation-client')
    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({ sendDefaultPii: false }),
    )
  })

  // --- beforeSend PII scrubbing ---------------------------------------------

  it('beforeSend strips user, breadcrumbs, and sensitive request fields', async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://client@sentry.io/1'
    await import('./instrumentation-client')

    const { beforeSend } = mockInit.mock.calls[0][0] as {
      beforeSend: (e: Record<string, unknown>) => Record<string, unknown>
    }

    const fakeEvent = {
      user: { id: 'u42', email: 'user@example.com' },
      breadcrumbs: [{ type: 'navigation', message: 'click' }],
      request: {
        url: 'https://app.example.com/secret',
        cookies: 'token=xyz',
        data: { creditCard: '4111111111111111' },
        headers: { cookie: 'session=secret' },
        method: 'GET', // should remain
      },
    }

    const result = beforeSend(fakeEvent) as typeof fakeEvent

    expect(result.user).toBeUndefined()
    expect(result.breadcrumbs).toBeUndefined()
    expect(result.request.url).toBeUndefined()
    expect(result.request.cookies).toBeUndefined()
    expect(result.request.data).toBeUndefined()
    expect(result.request.headers).toBeUndefined()
    // non-PII request field preserved
    expect(result.request.method).toBe('GET')
  })

  it('beforeSend handles event with no request field gracefully', async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://client@sentry.io/1'
    await import('./instrumentation-client')

    const { beforeSend } = mockInit.mock.calls[0][0] as {
      beforeSend: (e: Record<string, unknown>) => Record<string, unknown>
    }

    const minimal = { message: 'bare error' }
    expect(() => beforeSend(minimal)).not.toThrow()
    expect(beforeSend(minimal)).toEqual({ message: 'bare error' })
  })

  // --- beforeBreadcrumb -----------------------------------------------------

  it('beforeBreadcrumb returns null for category "console"', async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://client@sentry.io/1'
    await import('./instrumentation-client')
    const { beforeBreadcrumb } = mockInit.mock.calls[0][0] as {
      beforeBreadcrumb: (b: { category?: string }) => null | { category?: string }
    }
    expect(beforeBreadcrumb({ category: 'console' })).toBeNull()
  })

  it('beforeBreadcrumb returns null for category "ui.click"', async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://client@sentry.io/1'
    await import('./instrumentation-client')
    const { beforeBreadcrumb } = mockInit.mock.calls[0][0] as {
      beforeBreadcrumb: (b: { category?: string }) => null | { category?: string }
    }
    expect(beforeBreadcrumb({ category: 'ui.click' })).toBeNull()
  })

  it('beforeBreadcrumb returns null for category "ui.input"', async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://client@sentry.io/1'
    await import('./instrumentation-client')
    const { beforeBreadcrumb } = mockInit.mock.calls[0][0] as {
      beforeBreadcrumb: (b: { category?: string }) => null | { category?: string }
    }
    expect(beforeBreadcrumb({ category: 'ui.input' })).toBeNull()
  })

  it('beforeBreadcrumb returns null for category "navigation"', async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://client@sentry.io/1'
    await import('./instrumentation-client')
    const { beforeBreadcrumb } = mockInit.mock.calls[0][0] as {
      beforeBreadcrumb: (b: { category?: string }) => null | { category?: string }
    }
    expect(beforeBreadcrumb({ category: 'navigation' })).toBeNull()
  })

  it('beforeBreadcrumb passes through category "info"', async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://client@sentry.io/1'
    await import('./instrumentation-client')
    const { beforeBreadcrumb } = mockInit.mock.calls[0][0] as {
      beforeBreadcrumb: (b: { category?: string }) => null | { category?: string }
    }
    const crumb = { category: 'info', message: 'page loaded' }
    expect(beforeBreadcrumb(crumb)).toEqual(crumb)
  })

  // --- onRouterTransitionStart re-export check ------------------------------

  it('onRouterTransitionStart is the same function as Sentry.captureRouterTransitionStart', async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://client@sentry.io/1'
    const mod = await import('./instrumentation-client')
    const sentry = await import('@sentry/nextjs')
    expect(mod.onRouterTransitionStart).toBe(sentry.captureRouterTransitionStart)
  })
})
