import { Router } from 'express';
import { BudgetController } from '../controllers/budget.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { createBudgetSchema, updateBudgetSchema } from '../validators/budget.validator';

const router = Router();
const budgetController = new BudgetController();

router.use(authenticate);

router.get('/', budgetController.getBudgets);
router.get('/:id', budgetController.getBudgetById);
router.post('/', validateRequest(createBudgetSchema), budgetController.createBudget);
router.put('/:id', validateRequest(updateBudgetSchema), budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);
router.get('/:id/status', budgetController.getBudgetStatus);

export default router;
