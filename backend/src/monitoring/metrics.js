import client from "prom-client";

const register = client.register;

client.collectDefaultMetrics({ register });

export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests received",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

export const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

export const socketioConnectionsActive = new client.Gauge({
  name: "socketio_connections_active",
  help: "Number of currently active Socket.IO connections",
  registers: [register],
});

export const socketioUsersConnected = new client.Gauge({
  name: "socketio_users_connected",
  help: "Number of unique authenticated users connected via Socket.IO",
  registers: [register],
});

export const meetingRoomsActive = new client.Gauge({
  name: "meeting_rooms_active",
  help: "Number of meeting rooms that currently have at least one participant",
  registers: [register],
});

export { register };
