import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';

import { env } from '../config/env';

const JWT_SECRET = env.JWT_SECRET;

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  username: string;
  name: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Middleware to authenticate requests using JWT Bearer tokens
 */
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  let token = req.cookies?.token;
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token) {
    res.status(401).json({ message: 'Access token is required' });
    return;
  }


  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Middleware to authorize requests based on user roles
 */
export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      return;
    }

    next();
  };
};
