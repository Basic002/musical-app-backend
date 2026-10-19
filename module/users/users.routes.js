import express from 'express';
import * as usersControllers from './users.controllers.js';

const router = express.Router();

// Voir son profil
router.get('/profile', usersControllers.getProfile);

// Modifier son profil
router.put('/profile', usersControllers.updateProfile);

// Modifier son mot de passe
router.put('/password', usersControllers.updatePassword);

// Supprimer son compte
router.delete('/profile', usersControllers.deleteUser);

// Ajouter/Retirer un favori
router.post('/favorites', usersControllers.toggleFavorite);

// Synchroniser les favoris (retirer automatiquement ceux qui n'existent plus)
router.post('/favorites/sync', usersControllers.syncFavorites);

export default router;