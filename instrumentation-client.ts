import * as Sentry from '@sentry/nextjs'

const DROPPED_BREADCRUMB_CATEGORIES = new Set([
  'console',
  'ui.click',
  'ui.input',
  'navigation',
])

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    enabled: process.env.NODE_ENV === 'production',
    environment:
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    defaultIntegrations: false,
    integrations: [],
    beforeSend(event) {
      delete event.user
      delete event.breadcrumbs
      if (event.request) {
        delete event.request.url
        delete event.request.cookies
        delete event.request.data
        delete event.request.headers
      }
      return event
    },
    beforeBreadcrumb(breadcrumb) {
      if (
        breadcrumb.category &&
        DROPPED_BREADCRUMB_CATEGORIES.has(breadcrumb.category)
      ) {
        return null
      }
      return breadcrumb
    },
  })
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
