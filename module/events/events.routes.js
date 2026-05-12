import express from 'express';
import * as eventsControllers from './events.controllers.js';

const router = express.Router();

// --- VISITEUR ---
// GET - Récupérer tous les événements de la BDD (/api/events)
router.get('/', eventsControllers.getAllEvents);

// --- ADMIN ---
// POST - Créer un nouvel événement (/api/events)
router.post('/', eventsControllers.createEvent);

// PUT - Modifier un événement existant (/api/events/:id)
router.put('/:id', eventsControllers.updateEvent);

// DELETE - Supprimer un événement (/api/events/:id)
router.delete('/:id', eventsControllers.deleteEvent);

export default router;