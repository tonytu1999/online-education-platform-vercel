# Database Initialization and Migration Guide

This document explains how to initialize, migrate, and seed the backend database.

## Prerequisites

- Node.js and npm installed
- `.env` file configured with a valid `DATABASE_URL`
- The MySQL database must be reachable from your machine

```dotenv
DATABASE_URL="mysql://root:password@23.251.151.121:3306/education_platform"
```

---

## Pushing a New Schema to the Database

Use this when you have edited `prisma/schema.prisma` (added a field, changed a type, added an enum, etc.) and want to apply it to the database **without** creating a named migration file.

```bash
npm run db:push
```

This runs `prisma db push`, which:
1. Validates the schema
2. Generates a new Prisma client
3. Applies the diff directly to the database

> **Regenerate client separately on Windows if needed**
> If `db:push` fails with a rename/EPERM error, stop the server, then run:
> ```bash
> npx prisma generate
> npx prisma db push
> ```

After any schema push, restart the backend server so it picks up the updated Prisma client.

---

## Available Commands

Run all commands from the `backend/` folder.

| Command | What it does |
|---|---|
| `npm run db:push` | Push schema changes directly to the database (no migration file) |
| `npm run db:migrate` | Apply all pending named migration files |
| `npm run db:seed` | Load seed data into the database |
| `npm run db:init` | Apply migrations + seed (first-time setup) |
| `npm run db:reset` | Drop and recreate the schema (**destroys all data**) |

---

## Recommended Workflows

### First-time setup

```bash
npm run db:push     # create tables from schema
npm run db:seed     # load initial data
```

### After changing schema.prisma

```bash
npm run db:push     # apply changes to DB and regenerate client
```

Restart the server after pushing.

### Reseed without touching schema

```bash
npm run db:seed
```

### Full local reset

```bash
npm run db:reset    # drops all tables
npm run db:push     # recreate from schema
npm run db:seed     # reload seed data
```

---

## Seed Data

The seed script (`prisma/seed.ts`) is idempotent — safe to run multiple times.

**Users** (all use password: `password123`)

| Email | Role |
|---|---|
| admin@school.com | SCHOOL_ADMIN |
| teacher@school.com | TEACHER |
| student@school.com | STUDENT |
| parent@family.com | PARENT |

**Subjects and Knowledge Points**

| Subject | Chapters | Knowledge Points |
|---|---|---|
| Chinese Language | Reading Comprehension, Writing, Language Conventions | 9 total |
| English Language | Reading, Writing, Listening and Speaking | 8 total |
| Mathematics | Algebra, Geometry, Statistics and Probability | 9 total |

**Other seed data**
- School (No. 1 High School)
- Class (Math 101) with teacher and student enrolled
- Parent–child relationship
- Sample progress record for Alice on Solving Linear Equations
- Sample mental health record for Alice
- Forbidden keywords: violence, suicide, self-harm, drugs
- System config: mental health prompt

---

## Windows Prisma Note

`prisma generate` can fail on Windows with a query engine rename error if the server is running.

1. Stop the backend server
2. Run `npx prisma generate`
3. Restart the server

---

## Troubleshooting

**Database connection fails**
- Confirm `DATABASE_URL` is correct
- Check the database host is reachable and firewall rules allow your IP

**`db:push` fails with enum/type errors**
- MySQL does not allow `DEFAULT` values on `TEXT` columns — use `@db.Text` without `@default("")`
- Enums must be defined at the schema level before referencing them in models

**Seed fails after a schema change**
- Run `npm run db:push` first to ensure the table structure matches the schema
- Then run `npm run db:seed`
