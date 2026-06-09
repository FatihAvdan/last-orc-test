import { Router, Request, Response, NextFunction } from 'express';
import { pool } from '../db';

export const seoRouter = Router();

seoRouter.get('/sitemap.xml', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const baseUrl = process.env.BASE_URL || 'https://devfolio.app';

    const profilesResult = await pool.query<{ slug: string; updated_at: string }>(
      'SELECT slug, updated_at FROM portfolios WHERE is_published = true',
    );

    const blogResult = await pool.query<{ slug: string; updated_at: string }>(
      'SELECT slug, updated_at FROM blog_posts WHERE is_published = true',
    );

    const urls: string[] = [
      `<url><loc>${baseUrl}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
      `<url><loc>${baseUrl}/blog</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`,
    ];

    for (const profile of profilesResult.rows) {
      urls.push(
        `<url><loc>${baseUrl}/p/${profile.slug}</loc><lastmod>${new Date(profile.updated_at).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
      );
    }

    for (const post of blogResult.rows) {
      urls.push(
        `<url><loc>${baseUrl}/blog/${post.slug}</loc><lastmod>${new Date(post.updated_at).toISOString()}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`,
      );
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (err) {
    next(err);
  }
});

seoRouter.get('/robots.txt', (_req: Request, res: Response) => {
  const baseUrl = process.env.BASE_URL || 'https://devfolio.app';
  res.setHeader('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /
Sitemap: ${baseUrl}/seo/sitemap.xml
`);
});
