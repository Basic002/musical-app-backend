import axios from 'axios';
import { mapper } from '../../models/index.mapper.js';

export const getEventsService = async () => {
    console.log("\n--- 🔍 DÉBUT DE LA REQUÊTE ---");
    
    const localEvents = await mapper.event.findAll();
    console.log(`📀 Événements Locaux (MongoDB) : ${localEvents.length}`);

    let apiEvents = [];
    const apiKey = process.env.TICKETMASTER_API_KEY;

    if (apiKey) {
        try {
            console.log("🌐 Appel à Ticketmaster en cours...");
            
            const url = `https://app.ticketmaster.com/discovery/v2/events.json?locale=*&classificationName=music&countryCode=FR&size=100&sort=date,asc&apikey=${apiKey}`;
            
            const response = await axios.get(url);
            
            if (response.data._embedded && response.data._embedded.events) {
                apiEvents = response.data._embedded.events;
                console.log(`✅ Succès ! Ticketmaster a renvoyé ${apiEvents.length} événements.`);
            } else {
                console.log("⚠️ Ticketmaster a répondu, mais il n'y a aucun événement à l'intérieur.");
            }
        } catch (error) {
            console.log("❌ Erreur API Ticketmaster ! Voici la cause exacte :");
            console.error(error.response ? error.response.data : error.message);
        }
    } else {
        console.log("⚠️ Aucune clé API TICKETMASTER_API_KEY trouvée dans ton fichier .env !");
    }
    
    console.log("--- 🏁 FIN DE LA REQUÊTE ---\n");

    return {
        localEvents,
        apiEvents
    };
};