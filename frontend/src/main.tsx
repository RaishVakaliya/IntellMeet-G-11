import "./sentry";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";
import { queryClient } from "./lib/queryClient.ts";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { SentryErrorBoundary } from "./components/SentryErrorBoundary.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SentryErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="intellmeet-theme">
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    </SentryErrorBoundary>
  </StrictMode>,
);
