declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: any;
        organizationId: string | null;
        createdAt: Date;
        updatedAt: Date;
        organization?: any;
      };
    }
  }
}

export {};
