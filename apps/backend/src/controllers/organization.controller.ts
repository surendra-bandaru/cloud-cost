import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class OrganizationController {
  getOrganizations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgs = await prisma.organization.findMany();
      res.json(orgs);
    } catch (error) {
      next(error);
    }
  };

  getOrganizationById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const org = await prisma.organization.findUnique({
        where: { id: req.params.id },
        include: { users: true, cloudAccounts: true },
      });
      res.json(org);
    } catch (error) {
      next(error);
    }
  };

  createOrganization = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const org = await prisma.organization.create({
        data: req.body,
      });
      res.status(201).json(org);
    } catch (error) {
      next(error);
    }
  };

  updateOrganization = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const org = await prisma.organization.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.json(org);
    } catch (error) {
      next(error);
    }
  };

  deleteOrganization = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.organization.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
