import * as eventsServices from './events.services.js';

export const getAllEvents = async (req, res) => {
    try {
        const data = await eventsServices.getEventsService();
        const combinedEvents = [...data.localEvents, ...data.apiEvents];

        res.status(200).json({
            success: true,
            events: combinedEvents
        });
    } catch (error) {
        console.error("Erreur dans le contrôleur des événements :", error);
        res.status(500).json({ 
            success: false, 
            message: "Impossible de récupérer les événements." 
        });
    }
};