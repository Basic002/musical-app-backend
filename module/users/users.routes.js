import express from 'express';
import * as usersControllers from './users.controllers.js';

const router = express.Router();

// Voir son profil
router.get('/profile', usersControllers.getProfile);

// Modifier son profil
router.put('/profile', usersControllers.updateProfile);

// Supprimer son compte
router.delete('/profile', usersControllers.deleteUser);

// Ajouter/Retirer un favori
router.post('/favorites', usersControllers.toggleFavorite);

export default router;