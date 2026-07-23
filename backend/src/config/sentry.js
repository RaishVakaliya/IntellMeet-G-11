import * as Sentry from "@sentry/node";

const dsn = process.env.SENTRY_DSN;
const environment =
  process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development";

if (dsn) {
  Sentry.init({
    dsn,
    environment,
    tracesSampleRate: environment === "production" ? 0.1 : 0,

    includeLocalVariables: environment === "production",
  });
}

export { Sentry };
