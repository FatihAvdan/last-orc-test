import { Router, Request, Response, NextFunction } from 'express';
import { pool } from '../db';
import type { PublicProfile, ErrorResponse } from '@devfolio/shared';

export const profilesRouter = Router();

profilesRouter.get(
  '/:slug',
  async (req: Request<{ slug: string }>, res: Response<PublicProfile | ErrorResponse>, next: NextFunction) => {
    try {
      const { slug } = req.params;

      const portfolioResult = await pool.query(
        `SELECT p.*, t.id as theme_id, t.name as theme_name, t.preset, t.colors, t.fonts, t.created_at as theme_created_at,
                u.name as user_name, u.email as user_email
         FROM portfolios p
         LEFT JOIN themes t ON p.theme_id = t.id
         LEFT JOIN users u ON p.user_id = u.id
         WHERE p.slug = $1 AND p.is_published = true`,
        [slug],
      );

      if (portfolioResult.rows.length === 0) {
        res.status(404).json({ error: 'Profile not found', statusCode: 404 });
        return;
      }

      const row = portfolioResult.rows[0];

      const projectsResult = await pool.query(
        'SELECT * FROM project_showcases WHERE portfolio_id = $1 ORDER BY order_index',
        [row.id],
      );

      const sectionsResult = await pool.query(
        'SELECT * FROM cv_sections WHERE portfolio_id = $1 ORDER BY order_index',
        [row.id],
      );

      const blogPostsResult = await pool.query(
        'SELECT * FROM blog_posts WHERE user_id = $1 AND is_published = true ORDER BY created_at DESC LIMIT 5',
        [row.user_id],
      );

      res.json({
        id: row.id,
        slug: row.slug,
        title: row.title,
        user: {
          name: row.user_name,
          email: row.user_email,
        },
        theme: {
          id: row.theme_id,
          name: row.theme_name,
          preset: row.preset,
          colors: row.colors,
          fonts: row.fonts,
          created_at: row.theme_created_at,
        },
        projects: projectsResult.rows,
        sections: sectionsResult.rows,
        blogPosts: blogPostsResult.rows,
        created_at: row.created_at,
        updated_at: row.updated_at,
      });
    } catch (err) {
      next(err);
    }
  },
);
