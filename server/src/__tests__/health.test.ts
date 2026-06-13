import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('../db', () => ({
  pool: {
    query: vi.fn(),
  },
}));

vi.mock('../redis', () => ({
  redis: {
    ping: vi.fn(),
    on: vi.fn(),
  },
}));

import { createApp } from '../index';
import { pool } from '../db';
import { redis } from '../redis';

describe('GET /api/health', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createApp();
  });

  it('returns healthy status when DB and Redis are up', async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ '?column?': 1 }] } as any);
    vi.mocked(redis.ping).mockResolvedValueOnce('PONG');

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body).toHaveProperty('timestamp');
    expect(typeof res.body.uptime).toBe('number');
  });

  it('returns degraded status when DB is down', async () => {
    vi.mocked(pool.query).mockRejectedValueOnce(new Error('connection refused'));
    vi.mocked(redis.ping).mockResolvedValueOnce('PONG');

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('degraded');
  });

  it('returns degraded status when Redis is down', async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ '?column?': 1 }] } as any);
    vi.mocked(redis.ping).mockRejectedValueOnce(new Error('connection refused'));

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('degraded');
  });

  it('returns degraded when both DB and Redis are down', async () => {
    vi.mocked(pool.query).mockRejectedValueOnce(new Error('connection refused'));
    vi.mocked(redis.ping).mockRejectedValueOnce(new Error('connection refused'));

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('degraded');
  });
});
