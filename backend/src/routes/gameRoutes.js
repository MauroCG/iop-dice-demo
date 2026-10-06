import { Router } from 'express';
import { gameController } from '../controllers/gameController.js';

const router = Router();

router.get('/state', gameController.getState);

export default router;
