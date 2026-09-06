# Ticket Frontend

React + TypeScript + Vite frontend for the ticket support system. It talks to the
`ticket-backend` Express API (see `../backend`).

## Stack

- React 19, TypeScript, Vite 8
- React Router v7
- TanStack Query v5 (server state)
- React Hook Form + Zod (forms/validation)
- Tailwind CSS v4 + shadcn/ui (Base UI / `base-nova`)
- lucide-react icons, next-themes (light/dark toggle)

## Prerequisites

- **Node.js >= 22** (Vite 8 / TypeScript 6 requirement)
- npm (comes with Node)

## Setup

```bash
npm install
```

If you get install errors related to native packages, make sure your Node version
matches the one above.

## Run

The backend must be running first (it listens on `http://localhost:8080`):

```bash
cd ../backend
npm install
npm start
```

Then, in this directory, start the dev server:

```bash
npm run dev
```

Open `http://localhost:5173` and sign in with one of the seed accounts from the
backend README, e.g.:

| Role        | Email                 | Password    |
| ----------- | --------------------- | ----------- |
| ENGINEER    | john@tickets.example  | john123456  |

## How the frontend talks to the backend

- In dev, Vite proxies every `/api/*` request to `http://localhost:8080`
  (see `server.proxy` in `vite.config.ts`). This keeps requests same-origin, so
  CORS is not an issue.
- Sessions are cookie-based; the API client sends `credentials: "include"`.
- To point at a different backend, set `VITE_API_URL` (used by both the proxy
  target and the client) — e.g. a `.env` file with `VITE_API_URL=http://localhost:9000`.

## Scripts

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start the Vite dev server          |
| `npm run build`   | Type-check (`tsc -b`) + production build |
| `npm run lint`    | Run ESLint                          |
| `npm run preview` | Preview the production build        |

## Notes

- Backend data is stored in memory — it resets on backend restart.
- This project is a UI for the `ticket-backend` API (`../backend`); on its own it
  has nothing real to show other than the layout.