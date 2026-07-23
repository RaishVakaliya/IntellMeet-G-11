import * as Sentry from "@sentry/react";

const dsn = import.meta.env.VITE_SENTRY_DSN;
const environment =
  import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE;

if (dsn) {
  Sentry.init({
    dsn,
    environment,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    tracesSampleRate: environment === "production" ? 0.1 : 0,

    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    beforeSend(event) {
      if (environment === "development") {
        console.warn("[Sentry] Error captured (not sent in dev):", event);
        return null;
      }
      return event;
    },
  });
}
