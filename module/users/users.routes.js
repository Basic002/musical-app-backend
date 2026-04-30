import express from 'express';
import * as usersControllers from './users.controllers.js';

const router = express.Router();

// Route de test en développement
router.get('/test', usersControllers.testUsers);

// UTILISATEUR/ADMIN : POST - Ajouter/retirer un favori (/api/users/favorites)
router.post('/favorites', usersControllers.getFavorites);

// UTILISATEUR/ADMIN : PUT - Modifier ses informations (/api/users/profile)
router.put('/profile', usersControllers.getProfile);

export default router;