import { pool } from '../db';
import type { Portfolio } from '@devfolio/shared';

export class PortfolioModel {
  static async createTable(): Promise<void> {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS portfolios (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        theme_id INTEGER NOT NULL REFERENCES themes(id),
        is_published BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
      CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON portfolios(slug);
    `);
  }

  static async findByUserId(userId: number): Promise<Portfolio[]> {
    const result = await pool.query<Portfolio>(
      `SELECT p.*, t.name as theme_name, t.preset as theme_preset, t.colors as theme_colors, t.fonts as theme_fonts
       FROM portfolios p
       JOIN themes t ON p.theme_id = t.id
       WHERE p.user_id = $1
       ORDER BY p.updated_at DESC`,
      [userId],
    );
    return result.rows;
  }

  static async findById(id: number): Promise<Portfolio | null> {
    const result = await pool.query<Portfolio>(
      `SELECT p.*, t.name as theme_name, t.preset as theme_preset, t.colors as theme_colors, t.fonts as theme_fonts
       FROM portfolios p
       JOIN themes t ON p.theme_id = t.id
       WHERE p.id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  static async findBySlug(slug: string): Promise<Portfolio | null> {
    const result = await pool.query<Portfolio>(
      `SELECT p.*, t.name as theme_name, t.preset as theme_preset, t.colors as theme_colors, t.fonts as theme_fonts
       FROM portfolios p
       JOIN themes t ON p.theme_id = t.id
       WHERE p.slug = $1`,
      [slug],
    );
    return result.rows[0] || null;
  }

  static async create(
    userId: number,
    title: string,
    slug: string,
    themeId: number,
    isPublished: boolean = false,
  ): Promise<Portfolio> {
    const result = await pool.query<Portfolio>(
      `INSERT INTO portfolios (user_id, title, slug, theme_id, is_published)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, title, slug, themeId, isPublished],
    );
    return result.rows[0];
  }

  static async update(
    id: number,
    fields: Partial<Pick<Portfolio, 'title' | 'slug' | 'theme_id' | 'is_published'>>,
  ): Promise<Portfolio | null> {
    const keys = Object.keys(fields) as Array<keyof typeof fields>;
    if (keys.length === 0) return null;

    const setClauses = keys.map((key, i) => `${key} = $${i + 2}`);
    const values = keys.map((k) => fields[k]);

    const result = await pool.query<Portfolio>(
      `UPDATE portfolios SET ${setClauses.join(', ')}, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id, ...values],
    );
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM portfolios WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async isOwner(portfolioId: number, userId: number): Promise<boolean> {
    const result = await pool.query(
      'SELECT id FROM portfolios WHERE id = $1 AND user_id = $2',
      [portfolioId, userId],
    );
    return (result.rowCount ?? 0) > 0;
  }
}
