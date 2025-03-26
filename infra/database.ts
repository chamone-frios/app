import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  ssl:
    process.env.POSTGRES_SSLMODE === 'require'
      ? { rejectUnauthorized: false }
      : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  options: `-c pool_mode=${process.env.POSTGRES_POOL_MODE || 'session'}`,
});

async function query(
  queryObject:
    | string
    | { text: string; name?: string; values?: unknown[]; rowMode?: 'array' }
) {
  const client = await pool.connect();

  try {
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    console.error('[Source database.ts@query()]', error);
    throw error;
  } finally {
    client.release();
  }
}

async function getClient() {
  return await pool.connect();
}

export { query, getClient, pool };
