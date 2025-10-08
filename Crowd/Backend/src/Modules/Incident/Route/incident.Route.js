import express from 'express';
import { createIncident, getIncidents, updateIncidentStatus, deleteIncident } from '../Controller/incident.controller.js'; // Import named exports
import multer from 'multer';

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

const router = express.Router();

// Define routes
router.get('/', getIncidents); // Use the named import directly
router.post('/', upload.single('image'), createIncident); // Use the named import directly
router.put('/:id/status', updateIncidentStatus); // Use the named import directly
router.delete('/:id', deleteIncident); // Use the named import directly

// Export router using ES Modules
export default router;
