import * as eventsServices from './events.services.js';

export const testEvents = (req, res) => {
    try {
        const result = eventsServices.testEventsService();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur interne du serveur" });
    }
};

export const getAll = (req, res) => {
    try {
        const result = eventsServices.getAllEvents();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur interne du serveur" });
    }
};

export const getById = (req, res) => {
    try {
        const eventId = req.params.id; // On récupère l'ID depuis l'URL
        const result = eventsServices.getEventById(eventId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur interne du serveur" });
    }
};