# Project Manager Web App

A full-stack project management app built with React, Express, and MongoDB, including authentication, role-based authorization, projects, tasks, dashboard stats, and deployment-ready configuration.

## Live URL

`TBD after deployment`

## GitHub Repository

`https://github.com/YOURUSERNAME/project-manager`

## Screenshots

- Login page (placeholder)
- Dashboard (placeholder)
- Projects board (placeholder)

## Tech Stack

- Frontend: React 18, Vite, TailwindCSS v3, React Router v6, Axios, TanStack Query v5, React Hook Form, Zod, Zustand, date-fns, Lucide React, Sonner, Recharts, DnD Kit
- Backend: Node.js, Express.js, MongoDB Atlas, Mongoose, JWT, bcryptjs, cors, helmet, morgan, dotenv, express-async-errors, express-validator
- Deployment: Railway (backend), Railway or Vercel (frontend)

## Local Setup

1. Clone repo and enter folder:
   - `git clone <repo-url>`
   - `cd project-manager`
2. Backend setup:
   - `cd backend`
   - `npm install`
   - `cp .env.example .env` (or create `.env` manually on Windows)
   - `npm run dev`
3. Frontend setup:
   - `cd frontend`
   - `npm install`
   - Create `.env` with `VITE_API_URL=http://localhost:5000/api`
   - `npm run dev`

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | JWT access token secret |
| `JWT_REFRESH_SECRET` | JWT refresh token secret |
| `PORT` | Backend port (default `5000`) |
| `NODE_ENV` | Environment name |
| `FRONTEND_URL` | Allowed CORS frontend URL |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:5000/api`) |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Current user |
| GET | `/api/projects` | List member projects |
| POST | `/api/projects` | Create project |
| GET | `/api/tasks/project/:projectId` | Project tasks |
| GET | `/api/tasks/my` | Current user assigned tasks |
| GET | `/api/dashboard/stats` | Dashboard stats |
| GET | `/api/users` | List users (ADMIN) |

## Deployment Guide (Summary)

1. Push code to GitHub.
2. Deploy backend on Railway (`backend` root) with environment variables.
3. Deploy frontend on Railway or Vercel (`frontend` root) and set `VITE_API_URL`.
4. Update backend `FRONTEND_URL` to live frontend URL.
5. Ensure MongoDB Atlas network access allows deployment traffic.
