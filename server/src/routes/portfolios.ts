import { Router, Response, NextFunction } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { PortfolioModel } from '../models/Portfolio';
import { ProjectShowcaseModel } from '../models/ProjectShowcase';
import { CVSectionModel } from '../models/CVSection';
import { ThemeModel } from '../models/Theme';
import type {
  PortfolioListResponse,
  PortfolioDetailResponse,
  PortfolioCreateRequest,
  PortfolioUpdateRequest,
  ErrorResponse,
  Theme,
} from '@devfolio/shared';

export const portfolioRouter = Router();

portfolioRouter.use(authenticate);

// ─── Themes ───────────────────────────────────────────────────────────────────

portfolioRouter.get(
  '/themes',
  async (_req: AuthRequest, res: Response<Theme[] | ErrorResponse>, next: NextFunction) => {
    try {
      const themes = await ThemeModel.findAll();
      res.json(themes);
    } catch (err) {
      next(err);
    }
  },
);

// ─── Portfolios CRUD ──────────────────────────────────────────────────────────

const createPortfolioValidations = [
  body('title').trim().notEmpty().withMessage('title is required'),
  body('slug')
    .trim()
    .notEmpty()
    .withMessage('slug is required')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('slug must be lowercase alphanumeric with optional hyphens'),
  body('theme_id').optional().isInt({ min: 1 }).withMessage('theme_id must be a positive integer'),
  body('is_published').optional().isBoolean().withMessage('is_published must be a boolean'),
];

portfolioRouter.post(
  '/',
  validate(createPortfolioValidations),
  async (req: AuthRequest, res: Response<PortfolioDetailResponse | ErrorResponse>, next: NextFunction) => {
    try {
      const { title, slug, theme_id, is_published } = req.body as PortfolioCreateRequest;

      const existing = await PortfolioModel.findBySlug(slug);
      if (existing) {
        res.status(409).json({ error: 'slug already taken', statusCode: 409 });
        return;
      }

      let themeId = theme_id ?? 1;
      if (theme_id) {
        const theme = await ThemeModel.findById(theme_id);
        if (!theme) {
          res.status(400).json({ error: 'theme not found', statusCode: 400 });
          return;
        }
      } else {
        const defaultTheme = await ThemeModel.findByPreset('minimal');
        if (defaultTheme) themeId = defaultTheme.id;
      }

      const portfolio = await PortfolioModel.create(req.user!.id, title, slug, themeId, is_published ?? false);

      res.status(201).json({ portfolio, projects: [], sections: [] });
    } catch (err) {
      next(err);
    }
  },
);

portfolioRouter.get(
  '/',
  async (req: AuthRequest, res: Response<PortfolioListResponse | ErrorResponse>, next: NextFunction) => {
    try {
      const portfolios = await PortfolioModel.findByUserId(req.user!.id);
      res.json({ portfolios });
    } catch (err) {
      next(err);
    }
  },
);

portfolioRouter.get(
  '/:id',
  validate([param('id').isInt({ min: 1 }).withMessage('id must be a positive integer')]),
  async (req: AuthRequest, res: Response<PortfolioDetailResponse | ErrorResponse>, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const portfolio = await PortfolioModel.findById(id);

      if (!portfolio) {
        res.status(404).json({ error: 'portfolio not found', statusCode: 404 });
        return;
      }

      const projects = await ProjectShowcaseModel.findByPortfolioId(id);
      const sections = await CVSectionModel.findByPortfolioId(id);

      res.json({ portfolio, projects, sections });
    } catch (err) {
      next(err);
    }
  },
);

const updatePortfolioValidations = [
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  body('title').optional().trim().notEmpty().withMessage('title must not be empty'),
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('slug must be lowercase alphanumeric with optional hyphens'),
  body('theme_id').optional().isInt({ min: 1 }).withMessage('theme_id must be a positive integer'),
  body('is_published').optional().isBoolean().withMessage('is_published must be a boolean'),
];

portfolioRouter.put(
  '/:id',
  validate(updatePortfolioValidations),
  async (req: AuthRequest, res: Response<PortfolioDetailResponse | ErrorResponse>, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      const isOwner = await PortfolioModel.isOwner(id, req.user!.id);
      if (!isOwner) {
        res.status(404).json({ error: 'portfolio not found', statusCode: 404 });
        return;
      }

      const { title, slug, theme_id, is_published } = req.body as PortfolioUpdateRequest;

      if (slug) {
        const existing = await PortfolioModel.findBySlug(slug);
        if (existing && existing.id !== id) {
          res.status(409).json({ error: 'slug already taken', statusCode: 409 });
          return;
        }
      }

      if (theme_id) {
        const theme = await ThemeModel.findById(theme_id);
        if (!theme) {
          res.status(400).json({ error: 'theme not found', statusCode: 400 });
          return;
        }
      }

      const fields: Record<string, unknown> = {};
      if (title !== undefined) fields.title = title;
      if (slug !== undefined) fields.slug = slug;
      if (theme_id !== undefined) fields.theme_id = theme_id;
      if (is_published !== undefined) fields.is_published = is_published;

      const portfolio = await PortfolioModel.update(id, fields);
      const projects = await ProjectShowcaseModel.findByPortfolioId(id);
      const sections = await CVSectionModel.findByPortfolioId(id);

      res.json({ portfolio: portfolio!, projects, sections });
    } catch (err) {
      next(err);
    }
  },
);

portfolioRouter.delete(
  '/:id',
  validate([param('id').isInt({ min: 1 }).withMessage('id must be a positive integer')]),
  async (req: AuthRequest, res: Response<ErrorResponse>, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      const isOwner = await PortfolioModel.isOwner(id, req.user!.id);
      if (!isOwner) {
        res.status(404).json({ error: 'portfolio not found', statusCode: 404 });
        return;
      }

      await PortfolioModel.delete(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);

// ─── Projects nested under portfolio ───────────────────────────────────────────

const createProjectValidations = [
  param('portfolioId').isInt({ min: 1 }).withMessage('portfolioId must be a positive integer'),
  body('title').trim().notEmpty().withMessage('title is required'),
  body('description').trim().notEmpty().withMessage('description is required'),
  body('image_url').optional({ values: 'null' }).isString().withMessage('image_url must be a string'),
  body('live_url').optional({ values: 'null' }).isString().withMessage('live_url must be a string'),
  body('repo_url').optional({ values: 'null' }).isString().withMessage('repo_url must be a string'),
  body('order_index').optional().isInt({ min: 0 }).withMessage('order_index must be a non-negative integer'),
];

portfolioRouter.post(
  '/:portfolioId/projects',
  validate(createProjectValidations),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const portfolioId = parseInt(req.params.portfolioId, 10);

      const isOwner = await PortfolioModel.isOwner(portfolioId, req.user!.id);
      if (!isOwner) {
        res.status(404).json({ error: 'portfolio not found', statusCode: 404 });
        return;
      }

      const { title, description, image_url, live_url, repo_url, order_index } = req.body;

      const project = await ProjectShowcaseModel.create({
        portfolioId,
        title,
        description,
        imageUrl: image_url ?? undefined,
        liveUrl: live_url ?? undefined,
        repoUrl: repo_url ?? undefined,
        orderIndex: order_index,
      });

      res.status(201).json(project);
    } catch (err) {
      next(err);
    }
  },
);

const updateProjectValidations = [
  param('portfolioId').isInt({ min: 1 }),
  param('projectId').isInt({ min: 1 }),
  body('title').optional().trim().notEmpty().withMessage('title must not be empty'),
  body('description').optional().trim().notEmpty().withMessage('description must not be empty'),
  body('image_url').optional({ values: 'null' }).isString(),
  body('live_url').optional({ values: 'null' }).isString(),
  body('repo_url').optional({ values: 'null' }).isString(),
  body('order_index').optional().isInt({ min: 0 }).withMessage('order_index must be a non-negative integer'),
];

portfolioRouter.put(
  '/:portfolioId/projects/:projectId',
  validate(updateProjectValidations),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const portfolioId = parseInt(req.params.portfolioId, 10);
      const projectId = parseInt(req.params.projectId, 10);

      const isOwner = await PortfolioModel.isOwner(portfolioId, req.user!.id);
      if (!isOwner) {
        res.status(404).json({ error: 'portfolio not found', statusCode: 404 });
        return;
      }

      const belongs = await ProjectShowcaseModel.belongsToPortfolio(projectId, portfolioId);
      if (!belongs) {
        res.status(404).json({ error: 'project not found', statusCode: 404 });
        return;
      }

      const { title, description, image_url, live_url, repo_url, order_index } = req.body;
      const fields: Record<string, unknown> = {};
      if (title !== undefined) fields.title = title;
      if (description !== undefined) fields.description = description;
      if (image_url !== undefined) fields.image_url = image_url;
      if (live_url !== undefined) fields.live_url = live_url;
      if (repo_url !== undefined) fields.repo_url = repo_url;
      if (order_index !== undefined) fields.order_index = order_index;

      const project = await ProjectShowcaseModel.update(projectId, fields);
      res.json(project);
    } catch (err) {
      next(err);
    }
  },
);

portfolioRouter.delete(
  '/:portfolioId/projects/:projectId',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const portfolioId = parseInt(req.params.portfolioId, 10);
      const projectId = parseInt(req.params.projectId, 10);

      const isOwner = await PortfolioModel.isOwner(portfolioId, req.user!.id);
      if (!isOwner) {
        res.status(404).json({ error: 'portfolio not found', statusCode: 404 });
        return;
      }

      const belongs = await ProjectShowcaseModel.belongsToPortfolio(projectId, portfolioId);
      if (!belongs) {
        res.status(404).json({ error: 'project not found', statusCode: 404 });
        return;
      }

      await ProjectShowcaseModel.delete(projectId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);

// ─── CV Sections nested under portfolio ────────────────────────────────────────

const createCVSectionValidations = [
  param('portfolioId').isInt({ min: 1 }),
  body('type')
    .isIn(['experience', 'education', 'skills', 'about'])
    .withMessage('type must be one of: experience, education, skills, about'),
  body('title').trim().notEmpty().withMessage('title is required'),
  body('content').isObject().withMessage('content must be an object'),
  body('order_index').optional().isInt({ min: 0 }).withMessage('order_index must be a non-negative integer'),
];

portfolioRouter.post(
  '/:portfolioId/sections',
  validate(createCVSectionValidations),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const portfolioId = parseInt(req.params.portfolioId, 10);

      const isOwner = await PortfolioModel.isOwner(portfolioId, req.user!.id);
      if (!isOwner) {
        res.status(404).json({ error: 'portfolio not found', statusCode: 404 });
        return;
      }

      const { type, title, content, order_index } = req.body;

      const section = await CVSectionModel.create({
        portfolioId,
        type,
        title,
        content,
        orderIndex: order_index,
      });

      res.status(201).json(section);
    } catch (err) {
      next(err);
    }
  },
);

const updateCVSectionValidations = [
  param('portfolioId').isInt({ min: 1 }),
  param('sectionId').isInt({ min: 1 }),
  body('type')
    .optional()
    .isIn(['experience', 'education', 'skills', 'about'])
    .withMessage('type must be one of: experience, education, skills, about'),
  body('title').optional().trim().notEmpty().withMessage('title must not be empty'),
  body('content').optional().isObject().withMessage('content must be an object'),
  body('order_index').optional().isInt({ min: 0 }).withMessage('order_index must be a non-negative integer'),
];

portfolioRouter.put(
  '/:portfolioId/sections/:sectionId',
  validate(updateCVSectionValidations),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const portfolioId = parseInt(req.params.portfolioId, 10);
      const sectionId = parseInt(req.params.sectionId, 10);

      const isOwner = await PortfolioModel.isOwner(portfolioId, req.user!.id);
      if (!isOwner) {
        res.status(404).json({ error: 'portfolio not found', statusCode: 404 });
        return;
      }

      const belongs = await CVSectionModel.belongsToPortfolio(sectionId, portfolioId);
      if (!belongs) {
        res.status(404).json({ error: 'section not found', statusCode: 404 });
        return;
      }

      const { type, title, content, order_index } = req.body;
      const fields: Record<string, unknown> = {};
      if (type !== undefined) fields.type = type;
      if (title !== undefined) fields.title = title;
      if (content !== undefined) fields.content = content;
      if (order_index !== undefined) fields.order_index = order_index;

      const section = await CVSectionModel.update(sectionId, fields);
      res.json(section);
    } catch (err) {
      next(err);
    }
  },
);

portfolioRouter.delete(
  '/:portfolioId/sections/:sectionId',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const portfolioId = parseInt(req.params.portfolioId, 10);
      const sectionId = parseInt(req.params.sectionId, 10);

      const isOwner = await PortfolioModel.isOwner(portfolioId, req.user!.id);
      if (!isOwner) {
        res.status(404).json({ error: 'portfolio not found', statusCode: 404 });
        return;
      }

      const belongs = await CVSectionModel.belongsToPortfolio(sectionId, portfolioId);
      if (!belongs) {
        res.status(404).json({ error: 'section not found', statusCode: 404 });
        return;
      }

      await CVSectionModel.delete(sectionId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);
