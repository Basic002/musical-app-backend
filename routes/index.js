import express from 'express';
import authRouter from '../module/auth/auth.routes.js';
import eventsRouter from '../module/events/events.routes.js';
import usersRouter from '../module/users/users.routes.js';

const router = express.Router();

// Branchement des modules
router.use('/auth', authRouter);
router.use('/events', eventsRouter);
router.use('/users', usersRouter);
// Gestion de l'erreur 404
router.use((req, res) => {
  res.status(404).json({ success: false, message: "Route API introuvable" });
});

export default router;