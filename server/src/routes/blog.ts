import { Router, Request, Response, NextFunction } from 'express';
import { marked } from 'marked';
import { pool } from '../db';
import type {
  BlogPost,
  BlogPostCreateRequest,
  BlogPostUpdateRequest,
  BlogPostListResponse,
  ErrorResponse,
} from '@devfolio/shared';

export const blogRouter = Router();

blogRouter.get(
  '/',
  async (req: Request, res: Response<BlogPostListResponse | ErrorResponse>, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const offset = (page - 1) * pageSize;

      const countResult = await pool.query<{ count: string }>(
        'SELECT COUNT(*) as count FROM blog_posts WHERE is_published = true',
      );
      const total = parseInt(countResult.rows[0].count, 10);

      const result = await pool.query<BlogPost>(
        'SELECT * FROM blog_posts WHERE is_published = true ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [pageSize, offset],
      );

      res.json({ posts: result.rows, total, page, pageSize });
    } catch (err) {
      next(err);
    }
  },
);

blogRouter.get(
  '/:slug',
  async (req: Request<{ slug: string }>, res: Response<BlogPost | ErrorResponse>, next: NextFunction) => {
    try {
      const { slug } = req.params;
      const result = await pool.query<BlogPost>(
        'SELECT * FROM blog_posts WHERE slug = $1 AND is_published = true',
        [slug],
      );
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Blog post not found', statusCode: 404 });
        return;
      }

      await pool.query(
        'UPDATE blog_posts SET views = views + 1 WHERE slug = $1',
        [slug],
      );
      result.rows[0].views += 1;
      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  },
);

blogRouter.post(
  '/',
  async (
    req: Request<object, BlogPost | ErrorResponse, BlogPostCreateRequest>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { title, slug, content_md, excerpt, cover_image, tags, is_published } = req.body;
      const content_html = marked.parse(content_md || '') as string;

      const result = await pool.query<BlogPost>(
        `INSERT INTO blog_posts (user_id, title, slug, content_md, content_html, excerpt, cover_image, tags, is_published)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [1, title, slug, content_md, content_html, excerpt || '', cover_image || null, tags || [], is_published ?? false],
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  },
);

blogRouter.put(
  '/:id',
  async (
    req: Request<{ id: string }, BlogPost | ErrorResponse, BlogPostUpdateRequest>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      const { title, slug, content_md, excerpt, cover_image, tags, is_published } = req.body;

      let content_html: string | undefined;
      if (content_md !== undefined) {
        content_html = marked.parse(content_md) as string;
      }

      const fields: string[] = [];
      const values: (string | number | boolean | string[] | null)[] = [];
      let paramIndex = 1;

      if (title !== undefined) { fields.push(`title = $${paramIndex++}`); values.push(title); }
      if (slug !== undefined) { fields.push(`slug = $${paramIndex++}`); values.push(slug); }
      if (content_md !== undefined) { fields.push(`content_md = $${paramIndex++}`); values.push(content_md); }
      if (content_html !== undefined) { fields.push(`content_html = $${paramIndex++}`); values.push(content_html); }
      if (excerpt !== undefined) { fields.push(`excerpt = $${paramIndex++}`); values.push(excerpt); }
      if (cover_image !== undefined) { fields.push(`cover_image = $${paramIndex++}`); values.push(cover_image); }
      if (tags !== undefined) { fields.push(`tags = $${paramIndex++}`); values.push(tags); }
      if (is_published !== undefined) { fields.push(`is_published = $${paramIndex++}`); values.push(is_published); }

      if (fields.length === 0) {
        res.status(400).json({ error: 'No fields to update', statusCode: 400 });
        return;
      }

      fields.push('updated_at = NOW()');
      values.push(id);

      const result = await pool.query<BlogPost>(
        `UPDATE blog_posts SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values,
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Blog post not found', statusCode: 404 });
        return;
      }
      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  },
);

blogRouter.delete(
  '/:id',
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM blog_posts WHERE id = $1', [id]);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
);
