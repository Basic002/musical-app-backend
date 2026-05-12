import * as eventsServices from './events.services.js';

export const getAllEvents = async (req, res) => {
    try {
        const result = await eventsServices.getAllEventsService();
        res.status(200).json(result);
    } catch (error) {
        console.error("Erreur Controller getAllEvents:", error);
        res.status(500).json({ success: false, message: "Erreur interne du serveur" });
    }
};

export const createEvent = async (req, res) => {
    try {
        const eventData = req.body;
        const result = await eventsServices.createEventService(eventData);
        res.status(201).json(result);
    } catch (error) {
        console.error("Erreur Controller createEvent:", error);
        res.status(500).json({ success: false, message: "Erreur interne du serveur" });
    }
};

export const updateEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const eventData = req.body;
        const result = await eventsServices.updateEventService(eventId, eventData);
        res.status(200).json(result);
    } catch (error) {
        console.error("Erreur Controller updateEvent:", error);
        res.status(500).json({ success: false, message: "Erreur interne du serveur" });
    }
};

export const deleteEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const result = await eventsServices.deleteEventService(eventId);
        res.status(200).json(result);
    } catch (error) {
        console.error("Erreur Controller deleteEvent:", error);
        res.status(500).json({ success: false, message: "Erreur interne du serveur" });
    }
};