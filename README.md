# TaskEngineX

TaskEngineX is a modern workspace-based task and team management platform built for collaborative work, role-based access control, and approval-driven task workflows.

It combines a React + TypeScript frontend with a Node.js + Express backend and MongoDB data layer to support personal productivity and team operations in a single system.

## Why TaskEngineX

TaskEngineX is designed for teams that need more than a simple todo app. It supports:

- Workspace-based organization for teams and departments
- Role-based access control (Admin, Assigner, Worker)
- Project-level task grouping
- Task assignment and approval flows
- Real-time updates using Socket.IO
- Google login and magic-link authentication
- Personal tasks alongside workspace tasks

## Features

### Workspace and project management

- Create and manage multiple workspaces
- Invite members and assign roles
- Organize work into projects within each workspace
- Manage project-level assigners and workers

### Task lifecycle and approval workflow

- Create tasks inside a workspace or project
- Assign tasks to workers
- Track task status from pending to completed
- Require approval before final task completion is accepted
- Support task rejection and resubmission

### Security and access control

- JWT-based authentication
- Workspace membership validation
- Project and role-based permissions
- Admin-only workspace management controls

### Real-time collaboration

- Live task updates over Socket.IO
- Frontend activity updates without constant page refreshes
- Shared workspace task activity

## Tech stack

### Frontend

- React 19
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Socket.IO client
- Recharts

### Backend

- Node.js
- Express 5
- TypeScript
- Mongoose
- Passport.js
- JWT
- Redis + Bull for background job queue
- Socket.IO

### Database and infra

- MongoDB
- Redis (local or managed such as Upstash)
- Render deployment configuration included

## Repository structure

```text
TaskEngineX/
├── backend/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── DATABASE_SCHEMA_REFERENCE.md
├── FILES_CHANGED.md
├── IMPLEMENTATION_SUMMARY.md
├── QUICK_START_TESTING.md
├── LICENSE
├── README.md
├── render.yaml
└── .gitignore
```

## Prerequisites

Before running the project, make sure you have:

- Node.js 22.12+ required
- npm or pnpm
- MongoDB instance running
- Redis instance running (optional for local development, but used by queue/email features)
- A Google OAuth app if using Google login

## Environment variables

Create a `.env` file inside the `backend` folder with variables similar to:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb://localhost:27017/taskenginex
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

MAGIC_LINK_SECRET=your_magic_link_secret
MAGIC_LINK_EXPIRES_IN=15m

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
EMAIL_FROM=noreply@taskengine.com

SENDGRID_API_KEY=your_sendgrid_key

REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

FRONTEND_URL=http://localhost:5173
```

## Running locally

### 1) Install backend dependencies

```bash
cd backend
npm install
```

### 2) Start the backend

```bash
npm run dev
```

The API will run on:

- http://localhost:5000

### 3) Install frontend dependencies

```bash
cd frontend
npm install
```

### 4) Start the frontend

```bash
npm run dev
```

The app will run on:

- http://localhost:5173

## Build for production

### Backend

```bash
cd backend
npm run build
```

### Frontend

```bash
cd frontend
npm run build
```

## Main API areas

The backend exposes routes under the following groups:

- `/api/auth` - signup, login, Google auth, magic link, current user
- `/api/workspaces` - workspace creation and membership management
- `/api/workspaces/:workspaceId/projects` - project management
- `/api/tasks` - personal and workspace task operations
- `/api/tasks/:taskId/subtasks` - subtask management

Examples:

- `POST /api/auth/signup`
- `POST /api/auth/magic-link/send`
- `GET /api/workspaces`
- `POST /api/workspaces/:workspaceId/projects`
- `POST /api/workspaces/:workspaceId/projects/:projectId/tasks`
- `PATCH /api/tasks/:id/mark-complete`
- `PATCH /api/tasks/:id/approval`

## Default app flow

1. Create or join a workspace
2. Create a project inside the workspace
3. Add assigners and workers to the project
4. Create tasks and assign them to workers
5. Workers mark tasks complete
6. Assigners review and approve or reject completion
7. Track task status and workspace activity through the dashboard

## Notes

- The project supports both personal task management and workspace-based enterprise-style workflows.
- Some documentation files in the repo (for example `IMPLEMENTATION_SUMMARY.md`) provide deeper technical details about the RBAC and approval architecture.
- If you are deploying to production, ensure your MongoDB, Redis, and OAuth credentials are configured correctly in your hosting environment.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

## Contributing

Contributions are welcome. If you want to improve TaskEngineX, open an issue or submit a pull request with a clear description of the change.

## Contact

For project questions, deployment help, or feature requests, reach out through the repository owner or project maintainer.
