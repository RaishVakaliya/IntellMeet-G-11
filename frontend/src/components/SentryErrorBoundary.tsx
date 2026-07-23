import React from "react";
import * as Sentry from "@sentry/react";

interface Props {
  children: React.ReactNode;
}

export const SentryErrorBoundary: React.FC<Props> = ({ children }) => {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <div
          role="alert"
          className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-8 gap-4"
        >
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground text-sm max-w-md text-center">
            An unexpected error occurred. Our team has been automatically
            notified.
          </p>
          {import.meta.env.DEV && (
            <pre className="text-xs text-destructive bg-destructive/10 rounded p-3 max-w-xl overflow-auto">
              {error instanceof Error ? error.message : String(error)}
            </pre>
          )}
          <button
            onClick={resetError}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
        </div>
      )}
      onError={(error, componentStack) => {
        console.error(
          "[SentryErrorBoundary] Caught error:",
          error,
          componentStack,
        );
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
};
