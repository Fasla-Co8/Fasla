import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

// Next.js imports server modules while collecting build metadata. Keep the module
// import-safe during `next build`; database-backed requests still require the
// real DATABASE_URL at runtime (Vercel Project Settings → Environment Variables).
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
if (!databaseUrl && !isBuildPhase) {
  throw new Error("DATABASE_URL is required. Add it in your deployment environment variables.");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl || "postgresql://postgres:postgres@127.0.0.1:5432/build_placeholder",
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool, { schema });
