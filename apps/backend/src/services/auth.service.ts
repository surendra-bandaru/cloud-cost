import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

let prisma: PrismaClient;

const getPrisma = () => {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
};

// In-memory store as fallback when DB is unavailable
const memUsers: any[] = [];

const generateToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string || 'fallback-secret', {
    expiresIn: '7d',
  } as any);
};

const sanitizeUser = (user: any) => {
  const { password, ...sanitized } = user;
  return sanitized;
};

export class AuthService {
  async register(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    try {
      const db = getPrisma();

      // Check if user exists
      const existing = await db.user.findUnique({ where: { email: data.email } });
      if (existing) throw new Error('User already exists');

      const user = await db.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          organization: data.organizationName
            ? { create: { name: data.organizationName, slug: data.organizationName.toLowerCase().replace(/\s+/g, '-') } }
            : undefined,
        },
        include: { organization: true },
      });

      const token = generateToken(user.id);
      return { user: sanitizeUser(user), token };

    } catch (dbError: any) {
      // Fallback to in-memory if DB unavailable
      if (dbError.message === 'User already exists') throw dbError;

      console.warn('DB unavailable, using in-memory store:', dbError.message);

      const existing = memUsers.find(u => u.email === data.email);
      if (existing) throw new Error('User already exists');

      const user = {
        id: `mem-${Date.now()}`,
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'USER',
        organizationId: null,
        organization: data.organizationName ? { id: `org-${Date.now()}`, name: data.organizationName } : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      memUsers.push(user);
      const token = generateToken(user.id);
      return { user: sanitizeUser(user), token };
    }
  }

  async login(data: any) {
    try {
      const db = getPrisma();

      const user = await db.user.findUnique({
        where: { email: data.email },
        include: { organization: true },
      });

      if (!user || !(await bcrypt.compare(data.password, user.password))) {
        throw new Error('Invalid credentials');
      }

      const token = generateToken(user.id);
      return { user: sanitizeUser(user), token };

    } catch (dbError: any) {
      if (dbError.message === 'Invalid credentials') throw dbError;

      // Fallback to in-memory
      console.warn('DB unavailable, using in-memory store:', dbError.message);

      const user = memUsers.find(u => u.email === data.email);
      if (!user || !(await bcrypt.compare(data.password, user.password))) {
        throw new Error('Invalid credentials');
      }

      const token = generateToken(user.id);
      return { user: sanitizeUser(user), token };
    }
  }

  async logout(userId: string) {
    try {
      const db = getPrisma();
      await db.session.deleteMany({ where: { userId } });
    } catch {
      // ignore
    }
  }
}
