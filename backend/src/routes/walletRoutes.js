import { Router } from 'express';
import { walletController } from '../controllers/walletController.js';

const router = Router();

router.get('/resolve', walletController.resolve);
router.post('/grant', walletController.grant);
router.post('/bet', walletController.bet);

export default router;
