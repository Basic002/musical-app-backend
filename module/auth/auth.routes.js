import express from 'express';
import * as authControllers from './auth.controllers.js';

const router = express.Router();

// Créer un compte
router.post('/register', authControllers.register);

// Se connecter (crée la session)
router.post('/login', authControllers.login);

// Se déconnecter (détruit la session)
router.post('/logout', authControllers.logout);

export default router;