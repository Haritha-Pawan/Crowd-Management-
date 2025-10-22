import { Router } from 'express';
import {
  createSpot,
  bulkCreateSpots,
 
  getSpotById,
  updateSpotStatus,
  getSpot,getOccupancyMetrics
} from '../Controller/spot.controller.js';

const router = Router();

router.post('/', createSpot);
router.post('/bulk', bulkCreateSpots);
router.get('/metrics', getOccupancyMetrics);


router.get('/', getSpot);
router.get('/:id', getSpotById);

router.patch('/:id/status', updateSpotStatus);

export default router;
