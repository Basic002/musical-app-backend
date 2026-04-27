import express from 'express';
import authRouter from '../module/auth/auth.routes.js';

const router = express.Router();

router.use('/auth', authRouter);

router.use((req, res) => {
  res.status(404).json({ error: "Route introuvable" });
});

export default router;