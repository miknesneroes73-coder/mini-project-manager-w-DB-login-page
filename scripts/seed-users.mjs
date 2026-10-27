import pg from 'pg';
import { randomUUID, randomBytes, scryptSync } from 'node:crypto';
import process from 'node:process';

const { Client } = pg;
const password = 'Admin123!';
const users = [
  { email: 'admin@example.com', tenantId: '11111111-1111-4111-8111-111111111111' },
  { email: 'tenantb@example.com', tenantId: '22222222-2222-4222-8222-222222222222' },
];

function hashPassword(value) {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(value, salt, 64);
  return `scrypt$${salt}$${derived.toString('hex')}`;
}

const client = new Client({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5433),
  user: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'mini_project_manager',
});

await client.connect();
try {
  for (const user of users) {
    const passwordHash = hashPassword(password);
    await client.query(
      `INSERT INTO users (id, email, "tenantId", "passwordHash")
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email)
       DO UPDATE SET "tenantId" = EXCLUDED."tenantId", "passwordHash" = EXCLUDED."passwordHash"`,
      [randomUUID(), user.email, user.tenantId, passwordHash],
    );
  }
  console.log('Demo users are ready.');
  console.log('admin@example.com / Admin123!');
  console.log('tenantb@example.com / Admin123!');
} finally {
  await client.end();
}
