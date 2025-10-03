import { Router } from 'express';
import {
  createZone,
  listZones,
  getZoneById,
  updateZone,
  deleteZone,
} from '../Controller/zone.controller.js';

const router = Router();

router.post('/', createZone);
router.get('/', listZones);
router.get('/:id', getZoneById);
router.put('/:id', updateZone);
router.delete('/:id', deleteZone);

export default router;
