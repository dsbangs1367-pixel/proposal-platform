import * as Sentry from '@sentry/nextjs'

const DROPPED_BREADCRUMB_CATEGORIES = new Set(['console', 'navigation'])

function initSentry() {
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN
  if (!dsn) return

  Sentry.init({
    dsn,
    enabled: process.env.NODE_ENV === 'production',
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    release: process.env.SENTRY_RELEASE,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    beforeSend(event) {
      delete event.user
      delete event.breadcrumbs
      if (event.request) {
        delete event.request.url
        delete event.request.cookies
        delete event.request.data
        delete event.request.headers
      }
      if (event.contexts) {
        delete event.contexts.nextjs
      }
      return event
    },
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.category && DROPPED_BREADCRUMB_CATEGORIES.has(breadcrumb.category)) {
        return null
      }
      return breadcrumb
    },
  })
}

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge') {
    initSentry()
  }
}

export const onRequestError = Sentry.captureRequestError
