import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  org: "dsb-digital",
  project: "proposal-platform",
  sentryUrl: "https://de.sentry.io/",
  silent: !process.env.CI,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  telemetry: false,
  tunnelRoute: "/monitoring",
  disableLogger: true,
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
