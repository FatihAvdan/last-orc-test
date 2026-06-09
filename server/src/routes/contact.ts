import { Router, Request, Response, NextFunction } from 'express';
import { pool } from '../db';
import type { ContactRequest, ContactResponse, ErrorResponse } from '@devfolio/shared';

export const contactRouter = Router();

contactRouter.post(
  '/',
  async (req: Request<object, ContactResponse | ErrorResponse, ContactRequest>, res: Response, next: NextFunction) => {
    try {
      const { name, email, subject, message } = req.body;

      if (!name || !email || !subject || !message) {
        res.status(400).json({ error: 'All fields are required', statusCode: 400 });
        return;
      }

      await pool.query(
        'INSERT INTO contact_messages (name, email, subject, message) VALUES ($1, $2, $3, $4)',
        [name, email, subject, message],
      );

      res.status(201).json({ success: true, message: 'Message sent successfully' });
    } catch (err) {
      next(err);
    }
  },
);

contactRouter.get(
  '/',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  },
);
