import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AlertController {
  getAlerts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const alerts = await prisma.alert.findMany({
        where: { userId: req.user?.id },
        orderBy: { createdAt: 'desc' },
      });
      res.json(alerts);
    } catch (error) {
      next(error);
    }
  };

  getAlertById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const alert = await prisma.alert.findUnique({
        where: { id: req.params.id },
      });
      res.json(alert);
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const alert = await prisma.alert.update({
        where: { id: req.params.id },
        data: { isRead: true },
      });
      res.json(alert);
    } catch (error) {
      next(error);
    }
  };

  deleteAlert = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.alert.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
