import test from 'node:test';
import assert from 'node:assert/strict';
import { env } from '../src/config/env.js';

test('loads required environment configuration', () => {
  assert(env.port > 0, 'PORT must be a positive number');
  assert(env.db.host, 'DB_HOST is required');
  assert(env.db.user, 'DB_USER is required');
  assert(env.db.database, 'DB_NAME is required');
  assert(env.jwt.secret, 'JWT_SECRET is required');
  assert(env.clientUrl.startsWith('http'), 'CLIENT_URL must be a valid URL');
});
