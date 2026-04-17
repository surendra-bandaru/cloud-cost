import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CloudAccountController {
  getCloudAccounts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accounts = await prisma.cloudAccount.findMany({
        where: { organizationId: req.user?.organizationId },
      });
      res.json(accounts);
    } catch (error) {
      next(error);
    }
  };

  getCloudAccountById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const account = await prisma.cloudAccount.findUnique({
        where: { id: req.params.id },
      });
      res.json(account);
    } catch (error) {
      next(error);
    }
  };

  createCloudAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const account = await prisma.cloudAccount.create({
        data: {
          ...req.body,
          organizationId: req.user?.organizationId,
        },
      });
      res.status(201).json(account);
    } catch (error) {
      next(error);
    }
  };

  updateCloudAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const account = await prisma.cloudAccount.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.json(account);
    } catch (error) {
      next(error);
    }
  };

  deleteCloudAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.cloudAccount.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  syncAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ message: 'Sync initiated' });
    } catch (error) {
      next(error);
    }
  };
}
