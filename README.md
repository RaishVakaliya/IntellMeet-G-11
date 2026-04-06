# IntellMeet

MERN stack platform for AI-Powered Enterprise Meeting & Collaboration Platform

## Backend Dependencies

- **express**: Web framework for Node.js.
- **mongoose**: MongoDB object modeling tool.
- **dotenv**: Loads environment variables from a .env file.
- **cors**: Enables Cross-Origin Resource Sharing.
- **helmet**: Secures Express apps by setting various HTTP headers.
- **socket.io**: Enables real-time, bi-directional communication.
- **bcryptjs**: Used for password hashing.
- **jsonwebtoken**: For secure stateless authentication.
- **cookie-parser**: Parses cookie headers to handle refresh tokens.
- **cloudinary**: Cloud-based image and video management service.
- **multer**: Middleware for handling multipart/form-data for file uploads.
- **multer-storage-cloudinary**: Custom storage engine for multer to upload directly to Cloudinary.
- **express-rate-limit**: Basic rate-limiting middleware for Express.

## Setup

1. Clone the repository.
2. Setup environment variables:
   - Create a `.env` file in the `backend/` folder.
   - Refer to `backend/.env.example` for all required keys.
3. Install dependencies:
   - `cd backend && npm install`
   - `cd ../frontend && npm install`

## Run Development Server

### Backend

1. Go to the backend folder: `cd backend`
2. Start the server: `npm run dev`

### Frontend

1. Go to the frontend folder: `cd frontend`
2. Start the vite server: `npm run dev`
