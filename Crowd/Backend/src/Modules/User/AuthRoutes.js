
import express from 'express';
import { fogetPassword, login, resetPassword } from '../User/AuthController.js';
const router = express.Router();    

// Login route
router.post('/', login);   

router.post('/forgot-password', fogetPassword);

router.post('/reset-password/:token', resetPassword);

export default router;    