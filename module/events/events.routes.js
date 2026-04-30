import express from 'express';
import * as eventsControllers from './events.controllers.js';

const router = express.Router();

// Route de test en développement
router.get('/test', eventsControllers.testEvents);

// --- VISITEUR ---
// GET - Liste des événements filtrés (/api/events)
router.get('/', eventsControllers.getAll);


// --- ADMIN ---
// POST - Créer un nouvel événement (/api/events)
router.post('/', (req, res) => {
    res.status(201).json({ message: "Création d'un événement (Admin)" });
});

// PUT - Modifier un événement existant (/api/events/:id)
router.put('/:id', (req, res) => {
    res.status(200).json({ message: `Modification de l'événement ${req.params.id} (Admin)` });
});

// DELETE - Supprimer un événement (/api/events/:id)
router.delete('/:id', (req, res) => {
    res.status(200).json({ message: `Suppression de l'événement ${req.params.id} (Admin)` });
});

export default router;