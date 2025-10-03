import { Router } from 'express';
import {
  createSpot,
  bulkCreateSpots,
 
  getSpotById,
  updateSpotStatus,
  getSpot,
} from '../Controller/spot.controller.js';

const router = Router();

router.post('/', createSpot);
router.post('/bulk', bulkCreateSpots);

router.get('/', getSpot);
router.get('/:id', getSpotById);

router.patch('/:id/status', updateSpotStatus);

export default router;
