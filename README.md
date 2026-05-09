# Secure Online Exam System

A university-grade secure online examination platform built with **Next.js**, **Node.js/Express**, and **PostgreSQL**. The system design is formally specified using **Z notation**, which drives every module, database table, and API endpoint.

---

## Overview

The system serves three user roles:

| Role | Capabilities |
|---|---|
| **Student** | Enrol in exams, take exams under browser lockdown, view results |
| **Lecturer** | Create and publish exams, manage question banks, review results and proctor reports |
| **Admin** | Manage user accounts and role assignments |

### Key Security Features

- **Anti-cheating browser lockdown** — fullscreen enforcement, tab-switch detection, DevTools detection, clipboard blocking, and right-click disabling during active exams. Every violation is logged server-side and cannot be deleted by the student.
- **Question leak prevention** — all questions and answers are stored AES-256-GCM encrypted. Decryption happens server-side only. Questions are delivered one at a time; the full question set is never sent to the client.
- **Server-side time enforcement** — exam start times and remaining time are calculated on the server. A background job (node-cron) auto-submits expired sessions every 60 seconds, even if the student has closed the browser.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + React + Tailwind CSS + TypeScript |
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| Auth | JWT |
| Encryption | AES-256-GCM |
| Background Jobs | node-cron |

---

## Project Structure

```
308-web-app/
├── frontend/          # Next.js application
│   └── src/app/       # App Router pages (auth, student, lecturer, admin)
├── backend/           # Express API server
│   └── src/
│       ├── app.js
│       ├── server.js
│       └── db/
│           ├── client.js
│           ├── migrate.js
│           └── migrations/    # SQL migration files (001–007)
└── README.md
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) v14+
- npm

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd 308-web-app
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/<dbname>
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_32_byte_hex_encryption_key_here
```

Run the database migrations:

```bash
node src/db/migrate.js
```

Start the backend server:

```bash
# Development (auto-restarts on file changes)
npm run dev

# Production
npm start
```

The backend runs on `http://localhost:5000` by default.

---

### 3. Set up the frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend development server:

```bash
npm run dev
```

The frontend runs on `http://localhost:3000` by default.

---

## Running Both Servers

You need two terminals running simultaneously:

| Terminal | Command | URL |
|---|---|---|
| Backend | `cd backend && npm run dev` | `http://localhost:5000` |
| Frontend | `cd frontend && npm run dev` | `http://localhost:3000` |

---

## Database Migrations

Migrations are plain SQL files located in `backend/src/db/migrations/` and run in order:

| File | Table Created |
|---|---|
| `001_users.sql` | `users` |
| `002_exams.sql` | `exams` |
| `003_question_bank.sql` | `question_bank` |
| `004_exam_enrollments.sql` | `exam_enrollments` |
| `005_exam_sessions.sql` | `exam_sessions` |
| `006_proctor_logs.sql` | `proctor_logs` |
| `007_results.sql` | `results` |

Run them with:

```bash
cd backend && node src/db/migrate.js
```

---

## Frontend Pages

| Path | Role | Description |
|---|---|---|
| `/login` | All | Shared login — redirects by role on success |
| `/student/dashboard` | Student | List of enrolled exams with status |
| `/student/exam/[id]/waiting` | Student | Pre-exam rules and system check |
| `/student/exam/[id]/session` | Student | Lockdown exam interface |
| `/student/exam/[id]/result` | Student | Score and flagged status |
| `/lecturer/dashboard` | Lecturer | List of created exams |
| `/lecturer/exam/create` | Lecturer | Create a new exam |
| `/lecturer/exam/[id]/questions` | Lecturer | Manage question bank |
| `/lecturer/exam/[id]/results` | Lecturer | View results and proctor reports |
| `/admin/users` | Admin | User management |

---

## API Overview

All endpoints require a valid JWT in the `Authorization: Bearer <token>` header (except `/auth/login`).

| Group | Base Path | Accessible By |
|---|---|---|
| Auth | `/auth` | All |
| Exam management | `/exams` | Lecturer, Admin |
| Question bank | `/exams/:id/questions` | Lecturer |
| Student exam | `/session` | Student |
| Proctoring | `/proctor` | Student |
| Admin | `/admin` | Admin |
