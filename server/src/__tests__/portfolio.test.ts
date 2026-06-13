import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

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
import { config } from '../config';
import { PortfolioModel } from '../models/Portfolio';
import { ThemeModel } from '../models/Theme';
import { ProjectShowcaseModel } from '../models/ProjectShowcase';
import { CVSectionModel } from '../models/CVSection';

vi.mock('../models/Portfolio');
vi.mock('../models/Theme');
vi.mock('../models/ProjectShowcase');
vi.mock('../models/CVSection');

function generateToken(userId: number = 1, email: string = 'user@example.com'): string {
  return jwt.sign({ id: userId, email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);
}

describe('Portfolio Routes', () => {
  let app: ReturnType<typeof createApp>;
  let token: string;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createApp();
    token = generateToken();
  });

  describe('GET /api/portfolios/themes', () => {
    it('returns list of themes', async () => {
      const mockThemes: any[] = [
        { id: 1, name: 'Minimal', preset: 'minimal', colors: {}, fonts: {}, created_at: '2024-01-01' },
        { id: 2, name: 'Dark', preset: 'dark', colors: {}, fonts: {}, created_at: '2024-01-01' },
      ];

      vi.mocked(ThemeModel.findAll).mockResolvedValueOnce(mockThemes);

      const res = await request(app)
        .get('/api/portfolios/themes')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].name).toBe('Minimal');
    });

    it('returns 401 without auth token', async () => {
      const res = await request(app).get('/api/portfolios/themes');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/portfolios', () => {
    it('creates a new portfolio', async () => {
      vi.mocked(PortfolioModel.findBySlug).mockResolvedValueOnce(null);
      vi.mocked(PortfolioModel.create).mockResolvedValueOnce({
        id: 1,
        user_id: 1,
        title: 'My Portfolio',
        slug: 'my-portfolio',
        theme_id: 1,
        is_published: false,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });

      const res = await request(app)
        .post('/api/portfolios')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'My Portfolio',
          slug: 'my-portfolio',
        });

      expect(res.status).toBe(201);
      expect(res.body.portfolio.title).toBe('My Portfolio');
      expect(res.body.projects).toEqual([]);
      expect(res.body.sections).toEqual([]);
    });

    it('returns 409 when slug already taken', async () => {
      vi.mocked(PortfolioModel.findBySlug).mockResolvedValueOnce({
        id: 2,
        user_id: 2,
        title: 'Existing',
        slug: 'my-portfolio',
        theme_id: 1,
        is_published: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });

      const res = await request(app)
        .post('/api/portfolios')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'My Portfolio',
          slug: 'my-portfolio',
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('slug already taken');
    });

    it('returns 400 with invalid slug format', async () => {
      const res = await request(app)
        .post('/api/portfolios')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'My Portfolio',
          slug: 'INVALID SLUG!',
        });

      expect(res.status).toBe(400);
    });

    it('returns 401 without auth token', async () => {
      const res = await request(app).post('/api/portfolios').send({
        title: 'My Portfolio',
        slug: 'my-portfolio',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/portfolios', () => {
    it('returns user portfolios', async () => {
      const mockPortfolios = [
        { id: 1, user_id: 1, title: 'Portfolio 1', slug: 'p1', theme_id: 1, is_published: false, created_at: '2024-01-01', updated_at: '2024-01-01' },
      ];

      vi.mocked(PortfolioModel.findByUserId).mockResolvedValueOnce(mockPortfolios);

      const res = await request(app)
        .get('/api/portfolios')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.portfolios).toHaveLength(1);
    });
  });

  describe('GET /api/portfolios/:id', () => {
    it('returns portfolio detail with projects and sections', async () => {
      vi.mocked(PortfolioModel.findById).mockResolvedValueOnce({
        id: 1,
        user_id: 1,
        title: 'My Portfolio',
        slug: 'my-portfolio',
        theme_id: 1,
        is_published: false,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });
      vi.mocked(ProjectShowcaseModel.findByPortfolioId).mockResolvedValueOnce([]);
      vi.mocked(CVSectionModel.findByPortfolioId).mockResolvedValueOnce([]);

      const res = await request(app)
        .get('/api/portfolios/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.portfolio.title).toBe('My Portfolio');
    });

    it('returns 404 for non-existent portfolio', async () => {
      vi.mocked(PortfolioModel.findById).mockResolvedValueOnce(null);

      const res = await request(app)
        .get('/api/portfolios/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('returns 400 for invalid id', async () => {
      const res = await request(app)
        .get('/api/portfolios/abc')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/portfolios/:id', () => {
    it('updates a portfolio', async () => {
      vi.mocked(PortfolioModel.isOwner).mockResolvedValueOnce(true);
      vi.mocked(PortfolioModel.update).mockResolvedValueOnce({
        id: 1,
        user_id: 1,
        title: 'Updated Portfolio',
        slug: 'my-portfolio',
        theme_id: 1,
        is_published: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
      });
      vi.mocked(ProjectShowcaseModel.findByPortfolioId).mockResolvedValueOnce([]);
      vi.mocked(CVSectionModel.findByPortfolioId).mockResolvedValueOnce([]);

      const res = await request(app)
        .put('/api/portfolios/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Portfolio', is_published: true });

      expect(res.status).toBe(200);
      expect(res.body.portfolio.title).toBe('Updated Portfolio');
    });

    it('returns 404 when user is not the owner', async () => {
      vi.mocked(PortfolioModel.isOwner).mockResolvedValueOnce(false);

      const res = await request(app)
        .put('/api/portfolios/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Hacked' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/portfolios/:id', () => {
    it('deletes a portfolio', async () => {
      vi.mocked(PortfolioModel.isOwner).mockResolvedValueOnce(true);
      vi.mocked(PortfolioModel.delete).mockResolvedValueOnce(true);

      const res = await request(app)
        .delete('/api/portfolios/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(204);
    });

    it('returns 404 when user is not the owner', async () => {
      vi.mocked(PortfolioModel.isOwner).mockResolvedValueOnce(false);

      const res = await request(app)
        .delete('/api/portfolios/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
