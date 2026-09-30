# Ticket Frontend

React + TypeScript + Vite frontend for the ticket support system. It talks to the
MariaDB-backed `ticket-mariadb-backend` Express API (see `../mariadb_backend`).

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
cd ../mariadb_backend
npm install
cp .env.example .env   # set your MariaDB credentials
npm run db:setup
npm start
```

Then, in this directory, start the dev server:

```bash
npm run dev
```

Open `http://localhost:5173` and sign in with one of the seed accounts from the
backend README, e.g.:

| Username | Password     | Role       |
| -------- | ------------ | ---------- |
| arivera  | password123  | superadmin |
| mgomez   | password123  | admin      |
| schen    | password123  | area_manager |
| pnovak   | password123  | operator   |
| tokafor  | password123  | technician |
| dtaylor  | password123  | engineer   |
| zadler   | password123  | it         |

## Pages

- **/login** — sign in with username + password
- **/forgot-password** — request an email password-reset link
- **/reset-password** — set a new password from a reset link
- **/dashboard** — stats + critical tickets
- **/my-tickets** — tickets you reported or are assigned to
- **/notifications** — activity that needs your attention
- **/tickets/:id** — ticket detail with comments and attachments
- **/create-ticket** — report a new thermal/software/hardware ticket
- **/create-user** — admins and superadmins create new accounts (IT-managed)

The navbar carries a log-out button in the top right, next to the notification
bell and the theme toggle.

## Roles and permissions

Permissions are declared in `src/features/auth/permissions.ts` as a
`role -> Permission[]` map, and roles in `src/features/auth/auth.types.ts`.
The two are separate files on purpose: the type system fails the build if a role
is added without a permission entry.

| Role           | Sees                                                             |
| -------------- | ---------------------------------------------------------------- |
| `superadmin`   | Everything                                                       |
| `admin`        | **Only /create-user.** No dashboard, no tickets                  |
| `area_manager` | Dashboard, all tickets, user directory                           |
| `operator`     | Dashboard, own tickets; routes thermal/hardware to an engineer    |
| `technician`   | Dashboard, own tickets; routes software to IT                    |
| `engineer`     | Dashboard, own tickets (handles thermal/hardware)                |
| `it`           | Dashboard, own tickets (handles software)                        |

How the restrictions are applied:

- `RequirePermission` (`src/components/require-permission.tsx`) wraps every
  route that needs a permission. A user without it is redirected to their own
  landing page, so a hand-typed `/dashboard` as an admin just bounces back to
  /create-user instead of rendering.
- `usePermissions().can(...)` hides nav items and UI that a role cannot use.
- `homeRouteFor` (`src/features/auth/role-routing.ts`) picks the post-login
  landing page, which is why an admin lands on /create-user and not /dashboard.
- `CREATABLE_ROLES` limits the role dropdown on /create-user. The backend
  re-checks this independently — the list here is only a UX affordance.

- `ticket-assignment.ts` (`src/features/tickets/`) mirrors the backend routing
  table. It is what narrows the type dropdown to what your role may route, the
  assignee dropdown to the role that may receive that type, and the one-line
  hint under the type field. The backend re-checks every rule on create and on
  re-assignment, so this is a UX affordance, not the guard.

  | Type       | Who may route it | Must be assigned to |
  | ---------- | ---------------- | ------------------- |
  | `thermal`  | an `operator`    | an `engineer`       |
  | `hardware` | an `operator`    | an `engineer`       |
  | `software` | a `technician`   | an `it`             |

  `area_manager`, `admin` and `superadmin` are above the rules and may route any
  type to anyone. Leaving the assignee on *Unassigned* is always allowed.

Unknown roles coming from the API deny by default rather than throwing, so the
UI locks down instead of up if the backend is ahead of the frontend.

The backend applies the same rules server-side; see
`../mariadb_backend/README.md`.

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