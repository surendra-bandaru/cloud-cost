import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export class AuthService {
  async register(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
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

    const token = this.generateToken(user.id);

    return { user: this.sanitizeUser(user), token };
  }

  async login(data: any) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { organization: true },
    });

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user.id);

    return { user: this.sanitizeUser(user), token };
  }

  async logout(userId: string) {
    await prisma.session.deleteMany({ where: { userId } });
  }

  private generateToken(userId: string) {
    return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
      expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
    });
  }

  private sanitizeUser(user: any) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}
