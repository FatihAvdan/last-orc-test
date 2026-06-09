import { Router, Request, Response, NextFunction } from 'express';
import { pool } from '../db';
import type { AnalyticsSnapshot, ErrorResponse } from '@devfolio/shared';

export const analyticsRouter = Router();

analyticsRouter.get(
  '/',
  async (_req: Request, res: Response<AnalyticsSnapshot | ErrorResponse>, next: NextFunction) => {
    try {
      const totalViewsResult = await pool.query<{ count: string }>(
        'SELECT COUNT(*) as count FROM page_views',
      );
      const uniqueVisitorsResult = await pool.query<{ count: string }>(
        'SELECT COUNT(DISTINCT visitor_id) as count FROM page_views',
      );
      const todayResult = await pool.query<{ count: string }>(
        "SELECT COUNT(*) as count FROM page_views WHERE viewed_at >= CURRENT_DATE",
      );
      const weekResult = await pool.query<{ count: string }>(
        "SELECT COUNT(*) as count FROM page_views WHERE viewed_at >= CURRENT_DATE - INTERVAL '7 days'",
      );
      const monthResult = await pool.query<{ count: string }>(
        "SELECT COUNT(*) as count FROM page_views WHERE viewed_at >= CURRENT_DATE - INTERVAL '30 days'",
      );

      const topPagesResult = await pool.query<{ path: string; views: string }>(
        'SELECT path, COUNT(*) as views FROM page_views GROUP BY path ORDER BY views DESC LIMIT 10',
      );

      const dailyViewsResult = await pool.query<{ date: string; views: string }>(
        "SELECT DATE(viewed_at) as date, COUNT(*) as views FROM page_views WHERE viewed_at >= CURRENT_DATE - INTERVAL '30 days' GROUP BY DATE(viewed_at) ORDER BY date",
      );

      res.json({
        total_page_views: parseInt(totalViewsResult.rows[0]?.count || '0', 10),
        unique_visitors: parseInt(uniqueVisitorsResult.rows[0]?.count || '0', 10),
        views_today: parseInt(todayResult.rows[0]?.count || '0', 10),
        views_this_week: parseInt(weekResult.rows[0]?.count || '0', 10),
        views_this_month: parseInt(monthResult.rows[0]?.count || '0', 10),
        top_pages: topPagesResult.rows.map((r) => ({ path: r.path, views: parseInt(r.views, 10) })),
        daily_views: dailyViewsResult.rows.map((r) => ({ date: r.date, views: parseInt(r.views, 10) })),
        referrers: [],
        countries: [],
      });
    } catch (err) {
      next(err);
    }
  },
);

analyticsRouter.post(
  '/track',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { path, visitor_id, referrer } = req.body;
      await pool.query(
        'INSERT INTO page_views (path, visitor_id, referrer) VALUES ($1, $2, $3)',
        [path, visitor_id || 'anonymous', referrer || ''],
      );
      res.status(201).json({ tracked: true });
    } catch (err) {
      next(err);
    }
  },
);
