import Joi from 'joi';

export const createBudgetSchema = Joi.object({
  name: Joi.string().required(),
  amount: Joi.number().positive().required(),
  period: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY').required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().optional(),
  threshold: Joi.number().min(0).max(100).default(80),
  filters: Joi.object().optional(),
});

export const updateBudgetSchema = Joi.object({
  name: Joi.string().optional(),
  amount: Joi.number().positive().optional(),
  threshold: Joi.number().min(0).max(100).optional(),
  isActive: Joi.boolean().optional(),
});
