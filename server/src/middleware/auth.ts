import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import type { UserPayload } from '@devfolio/shared';

export interface AuthRequest extends Request {
  user?: UserPayload;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'authentication required', statusCode: 401 });
    return;
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, config.jwtSecret) as UserPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'invalid or expired token', statusCode: 401 });
  }
}
