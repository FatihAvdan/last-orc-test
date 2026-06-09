import { pool } from '../db';
import type { CVSection } from '@devfolio/shared';

export class CVSectionModel {
  static async createTable(): Promise<void> {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cv_sections (
        id SERIAL PRIMARY KEY,
        portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK (type IN ('experience', 'education', 'skills', 'about')),
        title VARCHAR(255) NOT NULL,
        content JSONB NOT NULL DEFAULT '{}',
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_cv_sections_portfolio_id ON cv_sections(portfolio_id);
    `);
  }

  static async findByPortfolioId(portfolioId: number): Promise<CVSection[]> {
    const result = await pool.query<CVSection>(
      'SELECT * FROM cv_sections WHERE portfolio_id = $1 ORDER BY order_index',
      [portfolioId],
    );
    return result.rows;
  }

  static async findById(id: number): Promise<CVSection | null> {
    const result = await pool.query<CVSection>(
      'SELECT * FROM cv_sections WHERE id = $1',
      [id],
    );
    return result.rows[0] || null;
  }

  static async create(data: {
    portfolioId: number;
    type: string;
    title: string;
    content: Record<string, unknown>;
    orderIndex?: number;
  }): Promise<CVSection> {
    const result = await pool.query<CVSection>(
      `INSERT INTO cv_sections (portfolio_id, type, title, content, order_index)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.portfolioId, data.type, data.title, JSON.stringify(data.content), data.orderIndex ?? 0],
    );
    return result.rows[0];
  }

  static async update(
    id: number,
    fields: Partial<{
      type: string;
      title: string;
      content: Record<string, unknown>;
      order_index: number;
    }>,
  ): Promise<CVSection | null> {
    const keys = Object.keys(fields) as Array<keyof typeof fields>;
    if (keys.length === 0) return null;

    const setClauses = keys.map((key, i) => {
      if (key === 'content') return `content = $${i + 2}::jsonb`;
      return `${key} = $${i + 2}`;
    });
    const values = keys.map((k) => (k === 'content' ? JSON.stringify(fields[k]) : fields[k]));

    const result = await pool.query<CVSection>(
      `UPDATE cv_sections SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`,
      [id, ...values],
    );
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM cv_sections WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async belongsToPortfolio(sectionId: number, portfolioId: number): Promise<boolean> {
    const result = await pool.query(
      'SELECT id FROM cv_sections WHERE id = $1 AND portfolio_id = $2',
      [sectionId, portfolioId],
    );
    return (result.rowCount ?? 0) > 0;
  }
}
