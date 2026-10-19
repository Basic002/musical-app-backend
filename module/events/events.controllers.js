import * as eventsServices from './events.services.js';

export const getAllEvents = async (req, res) => {
    try {
        const data = await eventsServices.getEventsService();
        res.status(200).json({
            success: true,
            events: data.apiEvents
        });
    } catch (error) {
        console.error("Erreur dans le contrôleur des événements :", error);
        res.status(500).json({ 
            success: false, 
            message: "Impossible de récupérer les événements." 
        });
    }
};