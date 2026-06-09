import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserModel } from '../models/User';
import type { RegisterRequest, LoginRequest, AuthResponse, ErrorResponse } from '@devfolio/shared';

export const authRouter = Router();

authRouter.post(
  '/register',
  async (req: Request<object, AuthResponse | ErrorResponse, RegisterRequest>, res: Response, next: NextFunction) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({ error: 'email, password, and name are required', statusCode: 400 });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ error: 'password must be at least 6 characters', statusCode: 400 });
        return;
      }

      const existing = await UserModel.findByEmail(email);
      if (existing) {
        res.status(409).json({ error: 'email already registered', statusCode: 409 });
        return;
      }

      const user = await UserModel.create(email, name, password);

      const token = jwt.sign(
        { id: user.id, email: user.email },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn } as jwt.SignOptions,
      );

      res.status(201).json({
        token,
        user: { id: user.id, email: user.email, name: user.name },
      });
    } catch (err) {
      next(err);
    }
  },
);

authRouter.post(
  '/login',
  async (req: Request<object, AuthResponse | ErrorResponse, LoginRequest>, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'email and password are required', statusCode: 400 });
        return;
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(401).json({ error: 'invalid email or password', statusCode: 401 });
        return;
      }

      const valid = await UserModel.verifyPassword(user, password);
      if (!valid) {
        res.status(401).json({ error: 'invalid email or password', statusCode: 401 });
        return;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn } as jwt.SignOptions,
      );

      res.json({
        token,
        user: { id: user.id, email: user.email, name: user.name },
      });
    } catch (err) {
      next(err);
    }
  },
);
