# Backend Starter | [Frontend Starter](https://github.com/progmamun/nextjs-starter-custom-better-auth)

A production-ready authentication backend built with **Node.js**, **Express.js**, **TypeScript**, **Prisma ORM**, and **PostgreSQL**.

This project provides secure authentication with email/password, Google OAuth, email verification, password reset, role-based access control, logging, and a modular architecture that is easy to maintain and scale.

---

# Features

- JWT Authentication
- Google OAuth Login
- Email Verification
- Forgot Password
- Password Reset via OTP
- Role Based Authorization
- Prisma ORM
- PostgreSQL
- Winston Logger
- Centralized Error Handling
- Modular Architecture
- TypeScript
- ESLint
- Docker Support
- Production Ready

---

# Tech Stack

| Technology  | Purpose          |
| ----------- | ---------------- |
| Node.js     | Runtime          |
| Express.js  | REST API         |
| TypeScript  | Type Safety      |
| Prisma      | ORM              |
| PostgreSQL  | Database         |
| Better Auth | Authentication   |
| Resend SMTP | Email Service    |
| Winston     | Logging          |
| Docker      | Containerization |

---

# Project Structure

```
.
├── prisma
│   ├── migrations
│   └── schema
│       ├── admin.prisma
│       ├── auth.prisma
│       ├── enums.prisma
│       ├── player.prisma
│       └── schema.prisma
│
├── src
│   ├── app
│   ├── config
│   ├── errors
│   ├── helpers
│   ├── interface
│   ├── lib
│   ├── middlewares
│   ├── modules
│   │   ├── admin
│   │   ├── auth
│   │   ├── logger
│   │   └── user
│   ├── routes
│   ├── templates
│   ├── utils
│   ├── generated
│   ├── app.ts
│   └── server.ts
│
├── uploads
├── logs
├── Dockerfile
├── docker-compose.yml
├── package.json
├── prisma.config.ts
└── README.md
```

---

# Folder Explanation

## prisma/

Contains everything related to the database.

### migrations/

Stores all Prisma migration files.

Never edit these manually.

---

### schema/

Database schema is split into multiple files for better maintainability.

Example:

- auth.prisma
- admin.prisma
- player.prisma
- enums.prisma

All schemas are merged by Prisma during generation.

---

## src/

Main application source code.

---

### app/

Application initialization.

Usually responsible for configuring Express.

Example:

- Express instance
- Global middleware
- Routes
- Error handler

---

### config/

Application configuration.

Examples:

- Environment variables
- Database
- Better Auth
- Logger
- SMTP

---

### errors/

Custom API errors.

Example:

- ApiError
- Global Error Handler

---

### helpers/

Reusable helper functions.

Example:

- Pagination
- JWT helper
- Date formatter

---

### interface/

Shared TypeScript interfaces.

---

### lib/

Third-party library configuration.

Examples:

- Prisma Client
- Better Auth
- Redis

---

### middlewares/

Express middlewares.

Examples:

- Authentication
- Authorization
- Validation
- File Upload
- Error Handler

---

### modules/

Business logic organized by feature.

Each module contains its own:

```
module-name/

controller.ts

service.ts

route.ts

validation.ts

interface.ts

constant.ts
```

Example modules:

```
auth/
user/
admin/
logger/
```

This keeps the project scalable.

---

### routes/

Combines all module routes into one root router.

---

### templates/

Email templates.

Example:

- Verify Email
- Forgot Password
- OTP

---

### utils/

Utility functions used across the application.

---

### generated/

Prisma generated client.

Do not edit manually.

---

### app.ts

Creates and configures Express application.

---

### server.ts

Application entry point.

Starts the HTTP server.

---

## uploads/

Stores uploaded files.

---

## logs/

Application log files.

Example:

```
logs/

errors/

successes/
```

Production URLs:

```
https://api.domain.com.bd/logs/errors

https://api.domain.com.bd/logs/successes
```

---

# Generate Better Auth Secret

A secret value used for encryption and hashing. It must be at least 32 characters and generated with high entropy. Click the button below to generate one. You can also use openssl rand -base64 32 to generate one.

- [Link-generate-auth-secret-via-better-auth](https://better-auth.com/docs/installation)

or use:

```bash
node -e "const crypto = require('crypto'); console.log(crypto.randomBytes(64).toString('hex'));"
```

---

# Database

This project uses PostgreSQL.

If using Supabase:

```
DATABASE_URL as Supabase -> DIRECT_URL
```

---

# Installation

Clone the repository.

```bash
git clone <repository-url>
```

Install dependencies.

```bash
pnpm install
```

---

# Prisma

Generate Prisma Client.

```bash
pnpm dlx prisma generate
```

Create a migration.

```bash
pnpm dlx prisma migrate dev
```

Deploy migrations in production.

```bash
pnpm dlx prisma migrate deploy
```

> **Important**
>
> Do **NOT** use `prisma db push` in production. Always use Prisma Migrations for PostgreSQL.

---

# Development

Start development server.

```bash
pnpm dev
```

---

# Lint

```bash
pnpm lint
```

---

# Build

```bash
pnpm build
```

---

# Production

```bash
pnpm prod
```

Equivalent to:

```bash
prisma migrate deploy
node dist/server.js
```

---

# Available Scripts

| Command       | Description                       |
| ------------- | --------------------------------- |
| pnpm dev      | Start development server          |
| pnpm build    | Build application                 |
| pnpm start    | Start production server           |
| pnpm prod     | Deploy migration and start server |
| pnpm lint     | Run ESLint                        |
| pnpm migrate  | Create migration                  |
| pnpm generate | Generate Prisma Client            |
| pnpm studio   | Open Prisma Studio                |
| pnpm push     | Prisma DB Push (Development Only) |
| pnpm pull     | Pull schema from database         |

---

# Google OAuth Callback

Development:

```
http://localhost:5000/api/auth/callback/google
```

---

# Logging

The project uses Winston Logger.

Log categories:

```
logs/errors/

logs/successes/
```

These logs help monitor production issues and API activity.

---

# API Architecture

```
Request
↓
Route
↓
Controller
↓
Service
↓
Prisma
↓
Database
↓
Response
```

---

# Coding Convention

Each module follows the same architecture.

```
Controller
↓
Service
↓
Database
```

Controllers should only handle:

- Request
- Response

Business logic belongs inside Services.

---

# Production Checklist

Before deploying:

- Install dependencies

```bash
pnpm install
```

- Generate Prisma Client

```bash
pnpm dlx prisma generate
```

- Run database migrations

```bash
pnpm dlx prisma migrate deploy
```

- Lint

```bash
pnpm lint
```

- Build

```bash
pnpm build
```

- Start production server

```bash
pnpm prod
```

---

# Best Practices

- Never edit migration files manually
- Use Prisma Migrations instead of `db push`
- Keep controllers thin
- Write business logic inside services
- Use centralized error handling
- Keep modules independent
- Validate all request payloads
- Store secrets securely
- Log production errors
