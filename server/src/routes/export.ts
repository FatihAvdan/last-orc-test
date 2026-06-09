import { Router, Request, Response, NextFunction } from 'express';
import { marked } from 'marked';
import { pool } from '../db';
import type { ExportRequest, ExportResponse, ErrorResponse } from '@devfolio/shared';

export const exportRouter = Router();

function buildHTML(profile: Record<string, unknown>): string {
  const title = (profile.title as string) || 'Portfolio';
  const projects = (profile.projects as Array<Record<string, unknown>>) || [];
  const sections = (profile.sections as Array<Record<string, unknown>>) || [];
  const theme = profile.theme as Record<string, unknown> | undefined;
  const colors = (theme?.colors as Record<string, string>) || {
    primary: '#3b82f6',
    background: '#ffffff',
    text: '#111827',
  };

  const projectsHTML = projects
    .map(
      (p) =>
        `<div style="margin-bottom:2rem"><h3>${p.title || ''}</h3><p>${p.description || ''}</p><p><a href="${p.live_url || '#'}">Live</a> | <a href="${p.repo_url || '#'}">Repo</a></p></div>`,
    )
    .join('');

  const sectionsHTML = sections
    .map(
      (s) =>
        `<div style="margin-bottom:2rem"><h3>${s.title || ''}</h3><pre>${JSON.stringify(s.content, null, 2)}</pre></div>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: ${colors.background}; color: ${colors.text}; max-width: 900px; margin: 0 auto; padding: 2rem; }
    h1 { color: ${colors.primary}; }
    .projects { margin-top: 2rem; }
    .sections { margin-top: 2rem; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="projects"><h2>Projects</h2>${projectsHTML}</div>
  <div class="sections"><h2>Sections</h2>${sectionsHTML}</div>
</body>
</html>`;
}

exportRouter.post(
  '/',
  async (
    req: Request<object, ExportResponse | ErrorResponse, ExportRequest>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { portfolioId, format } = req.body;

      const portfolioResult = await pool.query(
        `SELECT p.*, t.id as theme_id, t.name as theme_name, t.preset, t.colors, t.fonts
         FROM portfolios p LEFT JOIN themes t ON p.theme_id = t.id WHERE p.id = $1`,
        [portfolioId],
      );

      if (portfolioResult.rows.length === 0) {
        res.status(404).json({ error: 'Portfolio not found', statusCode: 404 });
        return;
      }

      const row = portfolioResult.rows[0];

      const projectsResult = await pool.query(
        'SELECT * FROM project_showcases WHERE portfolio_id = $1 ORDER BY order_index',
        [portfolioId],
      );

      const sectionsResult = await pool.query(
        'SELECT * FROM cv_sections WHERE portfolio_id = $1 ORDER BY order_index',
        [portfolioId],
      );

      const profile = {
        ...row,
        theme: {
          id: row.theme_id,
          name: row.theme_name,
          preset: row.preset,
          colors: row.colors,
          fonts: row.fonts,
        },
        projects: projectsResult.rows,
        sections: sectionsResult.rows,
      };

      if (format === 'pdf') {
        const html = buildHTML(profile);
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
        return;
      }

      const html = buildHTML(profile);
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (err) {
      next(err);
    }
  },
);
