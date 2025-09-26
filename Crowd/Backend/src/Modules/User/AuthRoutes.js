
import express from 'express';
import { login } from '../User/AuthController.js';
const router = express.Router();    

// Login route
router.post('/', login);   
export default router;    