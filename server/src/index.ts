import express from 'express';
import cors from 'cors';
import { config } from './config';
import { pool } from './db';
import { UserModel } from './models/User';
import { ThemeModel } from './models/Theme';
import { PortfolioModel } from './models/Portfolio';
import { ProjectShowcaseModel } from './models/ProjectShowcase';
import { CVSectionModel } from './models/CVSection';
import { authRouter } from './routes/auth';
import { healthRouter } from './routes/health';
import { portfolioRouter } from './routes/portfolios';
import { errorHandler } from './middleware/errorHandler';

async function main() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/health', healthRouter);
  app.use('/auth', authRouter);
  app.use('/api/portfolios', portfolioRouter);

  app.use(errorHandler);

  try {
    await UserModel.createTable();
    await ThemeModel.createTable();
    await ThemeModel.seed();
    await PortfolioModel.createTable();
    await ProjectShowcaseModel.createTable();
    await CVSectionModel.createTable();
    console.log('Database tables initialized');
  } catch (err) {
    console.error('Failed to initialize database tables:', err);
  }

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });

  process.on('SIGTERM', async () => {
    console.log('Shutting down...');
    await pool.end();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
