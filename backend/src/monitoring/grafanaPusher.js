import remoteWrite from "prometheus-remote-write";
import { register } from "./metrics.js";

export async function pushMetricsToGrafana() {
  const url = process.env.GRAFANA_CLOUD_URL;
  const username = process.env.GRAFANA_CLOUD_USERNAME;
  const password = process.env.GRAFANA_CLOUD_PASSWORD;

  if (!url || !username || !password) return;

  try {
    const metrics = await register.getMetricsAsJSON();
    const timestamp = Date.now();
    const timeseries = [];

    for (const m of metrics) {
      for (const v of m.values) {
        if (typeof v.value === "number" && !isNaN(v.value)) {
          const labels = { __name__: m.name };
          if (v.labels) {
            for (const [k, val] of Object.entries(v.labels)) {
              if (val !== undefined && val !== null) {
                labels[k] = String(val);
              }
            }
          }
          timeseries.push({
            labels,
            samples: [{ value: v.value, timestamp }],
          });
        }
      }
    }

    if (timeseries.length === 0) return;

    await remoteWrite.pushTimeseries(timeseries, {
      fetch: globalThis.fetch,
      url,
      auth: { username, password },
    });
  } catch (err) {}
}

export function startGrafanaPusher(intervalMs = 15000) {
  pushMetricsToGrafana();
  const timer = setInterval(pushMetricsToGrafana, intervalMs);
  if (timer.unref) timer.unref();
}
