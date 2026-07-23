import { httpRequestsTotal, httpRequestDurationSeconds } from "./metrics.js";

const EXCLUDED_PATHS = new Set(["/metrics", "/api/health", "/"]);

export const httpMetricsMiddleware = (req, res, next) => {
  if (EXCLUDED_PATHS.has(req.path)) {
    return next();
  }

  const startTime = process.hrtime.bigint();

  res.on("finish", () => {
    const durationSec = Number(process.hrtime.bigint() - startTime) / 1e9;
    const route = normalizeRoute(req);
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };

    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, durationSec);
  });

  next();
};

function normalizeRoute(req) {
  if (req.route?.path) {
    return (req.baseUrl || "") + req.route.path;
  }

  return req.path
    .replace(/\/[0-9a-f]{24}/gi, "/:id")
    .replace(/\/[A-Z0-9]{6,12}/g, "/:code")
    .replace(/\/\d+/g, "/:id");
}
