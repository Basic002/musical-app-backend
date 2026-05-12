import { mapper } from '../../models/index.mapper.js';

export const getAllEventsService = async () => {
    const events = await mapper.event.findAll();
    return { success: true, data: events };
};

export const createEventService = async (eventData) => {
    const newEvent = await mapper.event.create(eventData);
    return { success: true, message: "Événement créé avec succès !", data: newEvent };
};

export const updateEventService = async (id, eventData) => {
    const updatedEvent = await mapper.event.update(id, eventData);
    return { success: true, message: "Événement mis à jour !", data: updatedEvent };
};

export const deleteEventService = async (id) => {
    await mapper.event.delete(id);
    return { success: true, message: "Événement supprimé avec succès !" };
};