import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { redis } from '../redis';
import type { HealthResponse } from '@devfolio/shared';

export const healthRouter = Router();

healthRouter.get('/', async (_req: Request, res: Response<HealthResponse>) => {
  let dbStatus = 'ok';
  let redisStatus = 'ok';

  try {
    await pool.query('SELECT 1');
  } catch {
    dbStatus = 'error';
  }

  try {
    await redis.ping();
  } catch {
    redisStatus = 'error';
  }

  res.json({
    status: dbStatus === 'ok' && redisStatus === 'ok' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
