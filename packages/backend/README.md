# Backend

Express + TypeScript backend with PostgreSQL.

## Setup

1. Copy `.env.example` to `.env`
2. Update `DATABASE_URL` in `.env` with your database connection string

## Development

```bash
pnpm dev
```

Server runs on `http://localhost:3001`

## Using SQL Queries

```typescript
import { query } from "./db.js";

const result = await query("SELECT * FROM users WHERE id = $1", [userId]);
const users = result.rows;
```

## API Endpoints

- `GET /health` - Health check

