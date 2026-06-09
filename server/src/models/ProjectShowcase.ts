import { pool } from '../db';
import type { ProjectShowcase } from '@devfolio/shared';

export class ProjectShowcaseModel {
  static async createTable(): Promise<void> {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_showcases (
        id SERIAL PRIMARY KEY,
        portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        image_url VARCHAR(500),
        live_url VARCHAR(500),
        repo_url VARCHAR(500),
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_project_showcases_portfolio_id ON project_showcases(portfolio_id);
    `);
  }

  static async findByPortfolioId(portfolioId: number): Promise<ProjectShowcase[]> {
    const result = await pool.query<ProjectShowcase>(
      'SELECT * FROM project_showcases WHERE portfolio_id = $1 ORDER BY order_index',
      [portfolioId],
    );
    return result.rows;
  }

  static async findById(id: number): Promise<ProjectShowcase | null> {
    const result = await pool.query<ProjectShowcase>(
      'SELECT * FROM project_showcases WHERE id = $1',
      [id],
    );
    return result.rows[0] || null;
  }

  static async create(data: {
    portfolioId: number;
    title: string;
    description: string;
    imageUrl?: string;
    liveUrl?: string;
    repoUrl?: string;
    orderIndex?: number;
  }): Promise<ProjectShowcase> {
    const result = await pool.query<ProjectShowcase>(
      `INSERT INTO project_showcases (portfolio_id, title, description, image_url, live_url, repo_url, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        data.portfolioId,
        data.title,
        data.description,
        data.imageUrl || null,
        data.liveUrl || null,
        data.repoUrl || null,
        data.orderIndex ?? 0,
      ],
    );
    return result.rows[0];
  }

  static async update(
    id: number,
    fields: Partial<{
      title: string;
      description: string;
      image_url: string | null;
      live_url: string | null;
      repo_url: string | null;
      order_index: number;
    }>,
  ): Promise<ProjectShowcase | null> {
    const keys = Object.keys(fields) as Array<keyof typeof fields>;
    if (keys.length === 0) return null;

    const setClauses = keys.map((key, i) => `${key} = $${i + 2}`);
    const values = keys.map((k) => fields[k]);

    const result = await pool.query<ProjectShowcase>(
      `UPDATE project_showcases SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`,
      [id, ...values],
    );
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM project_showcases WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async belongsToPortfolio(projectId: number, portfolioId: number): Promise<boolean> {
    const result = await pool.query(
      'SELECT id FROM project_showcases WHERE id = $1 AND portfolio_id = $2',
      [projectId, portfolioId],
    );
    return (result.rowCount ?? 0) > 0;
  }
}
