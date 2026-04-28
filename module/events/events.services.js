export const getAllEvents = () => {
  console.log("Service Events : Récupération de la liste des événements...");
  // Plus tard : return await Event.find();
  return [
    { id: 1, artist: "Arctic Monkeys", venue: "Accor Arena, Paris", date: "12 Mai 2026" },
    { id: 2, artist: "Justice", venue: "Le Zénith, Paris", date: "Ce soir" },
    { id: 3, artist: "L'Impératrice", venue: "La Cigale, Paris", date: "18 Juin 2026" }
  ];
};

export const getEventById = (eventId) => {
  console.log(`Service Events : Récupération de l'événement avec l'ID ${eventId}`);
  // Plus tard : return await Event.findById(eventId);
  return { id: eventId, artist: "Artiste Test", venue: "Salle Test" };
};