import express from 'express';
import * as authControllers from './auth.controllers.js';

const router = express.Router();

// Route GET testable dans le navigateur
router.get('/test', authControllers.testAuth);

// Routes POST (à tester sur Postman)
router.post('/register', authControllers.register);
router.post('/login', authControllers.login);

export default router;