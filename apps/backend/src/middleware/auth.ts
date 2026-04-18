import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;
const getPrisma = () => {
  if (!prisma) prisma = new PrismaClient();
  return prisma;
};

// In-memory users fallback (shared with auth.service)
declare global {
  var memUsers: any[];
}
if (!global.memUsers) global.memUsers = [];

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    const decoded = jwt.verify(token, jwtSecret) as any;

    // Try DB first
    try {
      const db = getPrisma();
      const user = await db.user.findUnique({
        where: { id: decoded.userId },
        include: { organization: true },
      });

      if (user) {
        req.user = user as any;
        return next();
      }
    } catch (dbErr) {
      // DB unavailable, try in-memory
    }

    // Fallback: check in-memory store
    const memUser = global.memUsers.find((u: any) => u.id === decoded.userId);
    if (memUser) {
      req.user = memUser;
      return next();
    }

    return res.status(401).json({ error: 'User not found - please login again' });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
