import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('../db', () => ({
  pool: {
    query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  },
}));

vi.mock('../redis', () => ({
  redis: {
    ping: vi.fn(),
    on: vi.fn(),
  },
}));

import { createApp } from '../index';
import { UserModel } from '../models/User';
import jwt from 'jsonwebtoken';
import { config } from '../config';

vi.mock('../models/User');

describe('Auth Routes', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createApp();
  });

  describe('POST /api/auth/register', () => {
    it('registers a new user and returns token', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password_hash: 'hashed',
        created_at: new Date(),
      };

      vi.mocked(UserModel.findByEmail).mockResolvedValueOnce(null);
      vi.mocked(UserModel.create).mockResolvedValueOnce(mockUser);

      const res = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toEqual({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      });

      const payload = jwt.verify(res.body.token, config.jwtSecret) as Record<string, unknown>;
      expect(payload.id).toBe(1);
      expect(payload.email).toBe('test@example.com');
    });

    it('returns 400 when email is missing', async () => {
      const res = await request(app).post('/api/auth/register').send({
        password: 'password123',
        name: 'Test User',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('email, password, and name are required');
    });

    it('returns 400 when password is too short', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: '12345',
        name: 'Test User',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('password must be at least 6 characters');
    });

    it('returns 409 when email already registered', async () => {
      vi.mocked(UserModel.findByEmail).mockResolvedValueOnce({
        id: 1,
        email: 'test@example.com',
        name: 'Existing',
        password_hash: 'hash',
        created_at: new Date(),
      });

      const res = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('email already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in with valid credentials and returns token', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password_hash: 'hashed',
        created_at: new Date(),
      };

      vi.mocked(UserModel.findByEmail).mockResolvedValueOnce(mockUser);
      vi.mocked(UserModel.verifyPassword).mockResolvedValueOnce(true);

      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toEqual({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('returns 401 with invalid password', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password_hash: 'hashed',
        created_at: new Date(),
      };

      vi.mocked(UserModel.findByEmail).mockResolvedValueOnce(mockUser);
      vi.mocked(UserModel.verifyPassword).mockResolvedValueOnce(false);

      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('invalid email or password');
    });

    it('returns 401 with unknown email', async () => {
      vi.mocked(UserModel.findByEmail).mockResolvedValueOnce(null);

      const res = await request(app).post('/api/auth/login').send({
        email: 'unknown@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('invalid email or password');
    });

    it('returns 400 when email is missing', async () => {
      const res = await request(app).post('/api/auth/login').send({
        password: 'password123',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('email and password are required');
    });
  });
});
