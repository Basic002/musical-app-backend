import express from 'express';
import * as usersControllers from './users.controllers.js';

const router = express.Router();

router.get('/profile', usersControllers.getProfile);
router.post('/favorites', usersControllers.toggleFavorite);

export default router;