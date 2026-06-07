# Minnu Portfolio

A premium, glassmorphic personal portfolio website with a secure Admin Dashboard for full content CRUD, using a Node.js/Express/Mongoose (MongoDB Atlas) backend and a React 19/Vite/Tailwind CSS frontend.

## Project Structure

This is a monorepo consisting of:
- [backend](./backend): Express API server using MongoDB Mongoose models and Cloudinary media uploads.
- [portfolio](./portfolio): React 19 SPA built with Vite, Tailwind CSS, and Framer Motion.

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster (configured in environment) or local MongoDB instance

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env` file (see `.env.example`).
4. Seed the administrator credentials:
   ```bash
   node scripts/seed-admin.js --username <username> --password <password>
   ```
5. Run the server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd portfolio
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## License
MIT
