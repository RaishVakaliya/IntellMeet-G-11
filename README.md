<p align="center">
  <img src="./frontend/src/assets/AppLogo.png" alt="IntellMeet Logo" width="220" />
</p>

# IntellMeet

Enterprise Real-Time Video Collaboration & Meeting Platform built with the MERN stack.

## Technologies & Dependencies

### Backend Dependencies

- **express**: Core web framework for Node.js.
- **mongoose**: MongoDB object modeling tool.
- **dotenv**: Loads environment variables from a `.env` file.
- **cors**: Cross-Origin Resource Sharing middleware.
- **helmet**: Secures Express apps by setting various HTTP headers.
- **socket.io**: Enables real-time, bi-directional WebRTC signaling and meeting events.
- **@socket.io/redis-adapter**: Allows real-time socket events to scale horizontally across multiple instances.
- **bcryptjs**: Used for secure password hashing & OTP encryption.
- **jsonwebtoken**: Handles secure JWT authentication (Access & Refresh tokens).
- **cookie-parser**: Parses HTTP cookie headers for secure refresh token handling.
- **@react-email/components** & **@react-email/render**: Renders clean, responsive HTML email templates for transaction emails.
- **Brevo REST API**: Transactional email delivery service for email OTP authentication.
- **cloudinary** & **multer-storage-cloudinary**: Handles meeting recording uploads directly to Cloudinary.
- **express-rate-limit**: API rate-limiting middleware.
- **nanoid**: Generates short, unique meeting room codes.
- **redis**: In-memory data store for caching and pub/sub adapter.
- **prom-client**: Exposes system & application metrics for Prometheus monitoring.
- **prometheus-remote-write**: Automatically streams backend metrics directly to Grafana Cloud.
- **@sentry/node**: Application performance tracing and real-time error tracking.

### Frontend Dependencies

- **React 19**: Modern UI library with hooks.
- **framer-motion**: Motion library powering interactive OTP scatter/collapse animations.
- **Zustand**: Lightweight state management for active meeting rooms, auth, and audio/video controls.
- **TanStack Query (v5)**: Server-state caching and asynchronous query management.
- **Tailwind CSS**: Utility-first styling with modern dark glassmorphism design.
- **shadcn/ui**: Accessible UI components.
- **sonner**: Toast notification system.
- **lucide-react**: Modern icon library.

---

## Features

- **Email OTP Verification System**: Brevo transactional email delivery with 4-digit verification codes, light-themed responsive email template, 60s resend cooldown with deadline persistence, and interactive orbit scatter/collapse state-machine animations.
- **WebRTC Peer-to-Peer Video Grid**: Custom adaptive grid automatically adjusting layout based on active participant count.
- **Screen Sharing & Dynamic Track Swap**: Seamlessly toggle between WebCam and Screen Share without re-negotiation.
- **Mobile-Responsive Controls**: Mobile-friendly control bar featuring device detection (`isDisplayMediaSupported()`) to prevent mobile capture crashes.
- **Observability & Analytics**:
  - **Grafana Cloud Integration**: Background push (`prometheus-remote-write`) streaming real-time HTTP latencies and active socket metrics.
  - **Sentry Integration**: ESM preloaded error tracking (`--import`) with production performance sampling (`tracesSampleRate`).
- **Reliable Meeting Chat & Presence**: Real-time room chat with typing indicators and participant status highlights.
- **Collaborative Workspaces**: Integrated Kanban task board to manage meeting action items.
- **Secure Dual-Token Auth**: HttpOnly refresh cookies paired with Google OAuth2 & Email OTP authentication.
- **Production Docker Deployment**: Lightweight Docker image optimized for deployment platforms like Render.

---

## Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/RaishVakaliya/IntellMeet-G-11
   cd intellmeet
   ```

2. **Configure Environment Variables**:
   - Create a `.env` file in the `backend/` folder.
   - Refer to `backend/.env.example` for all required environment keys.

3. **Install Dependencies**:

   ```bash
   # Install backend dependencies
   cd backend && npm install

   # Install frontend dependencies
   cd ../frontend && npm install
   ```

---

## Run Development Server

### Backend

```bash
cd backend
npm run dev
```

### Frontend

```bash
cd frontend
npm run dev
```

---

## WebRTC Signaling Overview

Signaling is the process where browsers exchange connection metadata through Socket.IO to establish a direct Peer-to-Peer (P2P) media connection.

| Term              | Description                                                            |
| ----------------- | ---------------------------------------------------------------------- |
| **Offer**         | Peer A proposes a session with its media SDP capabilities.             |
| **Answer**        | Peer B accepts the offer and responds with its media SDP capabilities. |
| **ICE Candidate** | Network path options (IP addresses, ports) discovered by browsers.     |
