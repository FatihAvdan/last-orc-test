import { pool } from '../db';
import type { Theme, ThemePreset, ThemeColors, ThemeFonts } from '@devfolio/shared';

const PRESETS: Record<ThemePreset, { name: string; colors: ThemeColors; fonts: ThemeFonts }> = {
  minimal: {
    name: 'Minimal',
    colors: {
      primary: '#000000',
      secondary: '#666666',
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#111111',
      textSecondary: '#888888',
      accent: '#2563eb',
      border: '#e5e5e5',
    },
    fonts: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
  },
  dark: {
    name: 'Dark',
    colors: {
      primary: '#ffffff',
      secondary: '#aaaaaa',
      background: '#0a0a0a',
      surface: '#1a1a1a',
      text: '#f0f0f0',
      textSecondary: '#888888',
      accent: '#6366f1',
      border: '#333333',
    },
    fonts: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
      mono: 'Fira Code, monospace',
    },
  },
  gradient: {
    name: 'Gradient',
    colors: {
      primary: '#1e1b4b',
      secondary: '#4338ca',
      background: '#faf5ff',
      surface: '#ffffff',
      text: '#1e1b4b',
      textSecondary: '#64748b',
      accent: '#f43f5e',
      border: '#e2e8f0',
    },
    fonts: {
      heading: 'Poppins, sans-serif',
      body: 'Inter, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
  },
  glass: {
    name: 'Glass',
    colors: {
      primary: '#0f172a',
      secondary: '#475569',
      background: '#f8fafc',
      surface: 'rgba(255,255,255,0.7)',
      text: '#0f172a',
      textSecondary: '#64748b',
      accent: '#06b6d4',
      border: 'rgba(255,255,255,0.3)',
    },
    fonts: {
      heading: 'DM Sans, sans-serif',
      body: 'DM Sans, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
  },
  cyber: {
    name: 'Cyber',
    colors: {
      primary: '#00ff41',
      secondary: '#0d7377',
      background: '#0d0d0d',
      surface: '#1a1a2e',
      text: '#e0e0e0',
      textSecondary: '#888888',
      accent: '#ff0055',
      border: '#16213e',
    },
    fonts: {
      heading: 'Orbitron, sans-serif',
      body: 'Share Tech Mono, monospace',
      mono: 'Fira Code, monospace',
    },
  },
};

export class ThemeModel {
  static async createTable(): Promise<void> {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS themes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        preset VARCHAR(50) NOT NULL UNIQUE,
        colors JSONB NOT NULL,
        fonts JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
  }

  static async seed(): Promise<void> {
    const presets: ThemePreset[] = ['minimal', 'dark', 'gradient', 'glass', 'cyber'];

    for (const preset of presets) {
      const p = PRESETS[preset];
      await pool.query(
        `INSERT INTO themes (name, preset, colors, fonts)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (preset) DO UPDATE SET
           name = EXCLUDED.name,
           colors = EXCLUDED.colors,
           fonts = EXCLUDED.fonts`,
        [p.name, preset, JSON.stringify(p.colors), JSON.stringify(p.fonts)],
      );
    }
  }

  static async findAll(): Promise<Theme[]> {
    const result = await pool.query<Theme>('SELECT * FROM themes ORDER BY id');
    return result.rows;
  }

  static async findByPreset(preset: ThemePreset): Promise<Theme | null> {
    const result = await pool.query<Theme>('SELECT * FROM themes WHERE preset = $1', [preset]);
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<Theme | null> {
    const result = await pool.query<Theme>('SELECT * FROM themes WHERE id = $1', [id]);
    return result.rows[0] || null;
  }
}
