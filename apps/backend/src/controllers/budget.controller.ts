import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BudgetController {
  getBudgets = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const budgets = await prisma.budget.findMany({
        where: { organizationId: req.user?.organizationId ?? undefined },
      });
      res.json(budgets);
    } catch (error) {
      next(error);
    }
  };

  getBudgetById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const budget = await prisma.budget.findUnique({
        where: { id: req.params.id },
      });
      res.json(budget);
    } catch (error) {
      next(error);
    }
  };

  createBudget = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const budget = await prisma.budget.create({
        data: {
          ...req.body,
          organizationId: req.user?.organizationId ?? '',
          userId: req.user?.id ?? '',
        },
      });
      res.status(201).json(budget);
    } catch (error) {
      next(error);
    }
  };

  updateBudget = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const budget = await prisma.budget.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.json(budget);
    } catch (error) {
      next(error);
    }
  };

  deleteBudget = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.budget.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  getBudgetStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Implementation for budget status
      res.json({ status: 'ok' });
    } catch (error) {
      next(error);
    }
  };
}
