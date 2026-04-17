import { Router } from 'express';
import { CloudAccountController } from '../controllers/cloudAccount.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { createCloudAccountSchema } from '../validators/cloudAccount.validator';

const router = Router();
const cloudAccountController = new CloudAccountController();

router.use(authenticate);

router.get('/', cloudAccountController.getCloudAccounts);
router.get('/:id', cloudAccountController.getCloudAccountById);
router.post('/', validateRequest(createCloudAccountSchema), cloudAccountController.createCloudAccount);
router.put('/:id', cloudAccountController.updateCloudAccount);
router.delete('/:id', cloudAccountController.deleteCloudAccount);
router.post('/:id/sync', cloudAccountController.syncAccount);

export default router;
