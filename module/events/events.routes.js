import express from 'express';
import { getAllEvents } from './events.controllers.js';

const router = express.Router();
router.get('/', getAllEvents);

export default router;