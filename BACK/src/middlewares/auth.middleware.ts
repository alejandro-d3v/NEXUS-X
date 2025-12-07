import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { AuthPayload, UserRole } from '../types';

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const payload = authService.verifyToken(token);

    console.log('🔓 Token Decoded:', {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      roleType: typeof payload.role
    });

    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('🔐 Authorization Check:', {
      userRole: req.user.role,
      requiredRoles: roles,
      roleType: typeof req.user.role,
      userId: req.user.userId,
      email: req.user.email
    });

    if (!roles.includes(req.user.role)) {
      console.log('❌ Authorization FAILED - Role not in allowed list');
      return res.status(403).json({ error: 'Forbidden' });
    }

    console.log('✅ Authorization SUCCESS');
    return next();
  };
};

// Optional authentication - doesn't fail if no token provided
export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = authService.verifyToken(token);
      req.user = payload;
    }
    // If no token or invalid token, just continue without user
    return next();
  } catch (error) {
    // Invalid token, but we don't fail - just continue without user
    return next();
  }
};
