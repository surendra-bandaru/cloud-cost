import { Router } from 'express';
import { AlertController } from '../controllers/alert.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const alertController = new AlertController();

router.use(authenticate);

router.get('/', alertController.getAlerts);
router.get('/:id', alertController.getAlertById);
router.put('/:id/read', alertController.markAsRead);
router.delete('/:id', alertController.deleteAlert);

export default router;
