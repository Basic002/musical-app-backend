import { mapper } from '../../models/index.mapper.js';

function formatEvent(item) {
  return {
    ...item,
    _embedded: {
      venues: [{
        name: item.venue,
        city: { name: item.city },
        location: {
          latitude: String(item.latitude),
          longitude: String(item.longitude)
        }
      }]
    }
  };
}

// Cache mémoire pour répondre en < 2ms et éviter de surcharger les APIs
let cachedData = null;
let lastCacheTime = 0;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export const getEventsService = async () => {
  const nowTime = Date.now();
  if (cachedData && (nowTime - lastCacheTime < CACHE_TTL)) {
    return cachedData;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const nowIso = new Date().toISOString().split('.')[0] + 'Z';

  console.log("\n--- 🔍 REQUÊTE CONCERTS TICKETMASTER & OPEN CONCERTS MULTI-VILLES ---");

  // 1. Événements réels en BDD MongoDB créés par les utilisateurs
  let localFormatted = [];
  try {
    const rawLocal = await mapper.event.findAll();
    localFormatted = rawLocal
      .filter(doc => {
        const e = doc.toObject ? doc.toObject() : { ...doc };
        const hasName = Boolean(e.title || e.name);
        const hasLocation = Boolean(e.latitude && e.longitude);
        const hasValidUrl = e.url && typeof e.url === 'string' && e.url.startsWith('http') && e.url.length > 25 && !e.url.endsWith('ticketmaster.com');
        const eventDateStr = e.date ? new Date(e.date).toISOString().split('T')[0] : "";
        const isNotPast = !eventDateStr || eventDateStr >= todayStr;
        return hasName && hasLocation && hasValidUrl && isNotPast;
      })
      .map((doc) => {
        const e = doc.toObject ? doc.toObject() : { ...doc };
        return formatEvent({
          id: String(e._id),
          name: e.title || e.name,
          date: e.date ? new Date(e.date).toISOString().split('T')[0] : "À venir",
          time: "20:00",
          venue: e.location || "Salle Principale",
          city: e.city || "France",
          country: "France",
          latitude: Number(e.latitude),
          longitude: Number(e.longitude),
          images: [{ url: e.image || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80" }],
          url: e.url,
          description: e.description || "Concert live ajouté par la communauté."
        });
      });
  } catch (err) {
    console.error("Erreur lecture MongoDB :", err.message);
  }

// Dictionnaire de secours pour coordonnées GPS des grandes salles et villes françaises
const VENUE_GPS_FALLBACK = {
  'zenith de nancy': { lat: 48.711958, lng: 6.144459, city: 'Nancy' },
  'l\'autre canal': { lat: 48.694722, lng: 6.200833, city: 'Nancy' },
  'salle poirel': { lat: 48.689722, lng: 6.175556, city: 'Nancy' },
  'ldlc arena': { lat: 45.765278, lng: 4.981944, city: 'Lyon' },
  'halle tony garnier': { lat: 45.730278, lng: 4.825833, city: 'Lyon' },
  'arena d\'orleans': { lat: 47.902222, lng: 1.908889, city: 'Orléans' },
  'accor arena': { lat: 48.838889, lng: 2.378611, city: 'Paris' },
  'stade de france': { lat: 48.924444, lng: 2.360000, city: 'Saint-Denis' },
  'zenith de paris': { lat: 48.893889, lng: 2.393056, city: 'Paris' },
  'la bam': { lat: 49.123889, lng: 6.208889, city: 'Metz' },
  'les trinitaires': { lat: 49.120556, lng: 6.180278, city: 'Metz' },
  'l\'arsenal': { lat: 49.115278, lng: 6.170556, city: 'Metz' },
  'galaxie': { lat: 49.245209, lng: 6.131802, city: 'Amnéville' }
};

const CITY_GPS_FALLBACK = {
  'nancy': { lat: 48.692054, lng: 6.184417 },
  'maxeville': { lat: 48.711958, lng: 6.144459 },
  'metz': { lat: 49.119308, lng: 6.175716 },
  'amneville': { lat: 49.245209, lng: 6.131802 },
  'strasbourg': { lat: 48.573405, lng: 7.752111 },
  'eckbolsheim': { lat: 48.591111, lng: 7.685556 },
  'paris': { lat: 48.856614, lng: 2.352222 },
  'lyon': { lat: 45.764043, lng: 4.835659 },
  'marseille': { lat: 43.296482, lng: 5.36978 },
  'lille': { lat: 50.62925, lng: 3.057256 },
  'bordeaux': { lat: 44.837789, lng: -0.57918 },
  'nantes': { lat: 47.218371, lng: -1.553621 },
  'toulouse': { lat: 43.604652, lng: 1.444209 },
  'montpellier': { lat: 43.610769, lng: 3.876716 },
  'nice': { lat: 43.710173, lng: 7.261953 },
  'rennes': { lat: 48.117266, lng: -1.677793 },
  'dijon': { lat: 47.322047, lng: 5.04148 },
  'reims': { lat: 49.258329, lng: 4.031696 },
  'rouen': { lat: 49.443232, lng: 1.099971 }
};

  // 2. Événements réels Ticketmaster France (ticketmaster.fr exclusively)
  let ticketmasterFormatted = [];
  const apiKey = process.env.TICKETMASTER_API_KEY;

  if (apiKey) {
    try {
      const cleanKey = apiKey.trim();
      
      const tmQueries = [
        // Pages générales de musique en France (ticketmaster.fr)
        `countryCode=FR&locale=*&classificationName=Music&size=100&page=0&sort=date,asc&startDateTime=${nowIso}`,
        `countryCode=FR&locale=*&classificationName=Music&size=100&page=1&sort=date,asc&startDateTime=${nowIso}`,
        `countryCode=FR&locale=*&classificationName=Music&size=100&page=2&sort=date,asc&startDateTime=${nowIso}`,
        `countryCode=FR&locale=*&classificationName=Music&size=100&page=3&sort=date,asc&startDateTime=${nowIso}`,
        // Villes de Lorraine et Grand Est
        `countryCode=FR&locale=*&city=Nancy&size=100&sort=date,asc&startDateTime=${nowIso}`,
        `countryCode=FR&locale=*&city=Maxeville&size=100&sort=date,asc&startDateTime=${nowIso}`, // Zénith de Nancy
        `countryCode=FR&locale=*&city=Metz&size=100&sort=date,asc&startDateTime=${nowIso}`,
        `countryCode=FR&locale=*&city=Amneville&size=100&sort=date,asc&startDateTime=${nowIso}`, // Galaxie Amnéville
        `countryCode=FR&locale=*&city=Strasbourg&size=100&sort=date,asc&startDateTime=${nowIso}`,
        `countryCode=FR&locale=*&city=Eckbolsheim&size=100&sort=date,asc&startDateTime=${nowIso}`, // Zénith de Strasbourg
        // Grandes métropoles françaises
        `countryCode=FR&locale=*&city=Paris&classificationName=Music&size=100&sort=date,asc&startDateTime=${nowIso}`,
        `countryCode=FR&locale=*&city=Lyon&classificationName=Music&size=100&sort=date,asc&startDateTime=${nowIso}`,
        `countryCode=FR&locale=*&city=Marseille&classificationName=Music&size=100&sort=date,asc&startDateTime=${nowIso}`,
        `countryCode=FR&locale=*&city=Lille&classificationName=Music&size=100&sort=date,asc&startDateTime=${nowIso}`,
        `countryCode=FR&locale=*&city=Bordeaux&classificationName=Music&size=100&sort=date,asc&startDateTime=${nowIso}`,
        `countryCode=FR&locale=*&city=Nantes&classificationName=Music&size=100&sort=date,asc&startDateTime=${nowIso}`,
        `countryCode=FR&locale=*&city=Toulouse&classificationName=Music&size=100&sort=date,asc&startDateTime=${nowIso}`,
        `countryCode=FR&locale=*&city=Montpellier&classificationName=Music&size=100&sort=date,asc&startDateTime=${nowIso}`,
        `countryCode=FR&locale=*&city=Nice&classificationName=Music&size=100&sort=date,asc&startDateTime=${nowIso}`,
        `countryCode=FR&locale=*&city=Rennes&classificationName=Music&size=100&sort=date,asc&startDateTime=${nowIso}`,
        `countryCode=FR&locale=*&city=Dijon&classificationName=Music&size=100&sort=date,asc&startDateTime=${nowIso}`,
        `countryCode=FR&locale=*&classificationName=Music&size=100&page=4&sort=date,asc&startDateTime=${nowIso}`
      ];

      const tmPromises = tmQueries.map(async (q) => {
        const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${cleanKey}&${q}`;
        try {
          const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
          if (res.ok) {
            const d = await res.json();
            return d._embedded?.events || [];
          }
        } catch (e) {
          return [];
        }
        return [];
      });

      const tmResults = await Promise.allSettled(tmPromises);
      const rawEvents = tmResults
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value || []);

      ticketmasterFormatted = rawEvents
        .map(e => {
          const venue = e._embedded?.venues?.[0];
          const venueName = venue?.name || "Scène Musicale";
          let cityName = venue?.city?.name || "France";
          const venueLower = venueName.toLowerCase();
          const cityLower = cityName.toLowerCase();

          let lat = parseFloat(venue?.location?.latitude);
          let lng = parseFloat(venue?.location?.longitude);

          // Résolution intelligente si GPS manquant dans le payload Ticketmaster
          if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
            for (const [keyName, coords] of Object.entries(VENUE_GPS_FALLBACK)) {
              if (venueLower.includes(keyName)) {
                lat = coords.lat;
                lng = coords.lng;
                if (coords.city) cityName = coords.city;
                break;
              }
            }
          }

          if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
            for (const [cityNameKey, coords] of Object.entries(CITY_GPS_FALLBACK)) {
              if (cityLower.includes(cityNameKey)) {
                lat = coords.lat;
                lng = coords.lng;
                break;
              }
            }
          }

          const hasGps = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
          if (!hasGps) return null;

          const eventDate = e.dates?.start?.localDate;
          if (eventDate && eventDate < todayStr) return null;

          const bestImgObj = e.images?.find(img => img.ratio === '16_9' && img.width >= 500) || e.images?.[0];
          const bestImg = bestImgObj?.url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80";

          // Formatage d'URL 100% ticketmaster.fr
          let ticketUrl = e.url;
          if (!ticketUrl || !ticketUrl.includes('ticketmaster.fr')) {
            ticketUrl = `https://www.ticketmaster.fr/fr/recherche?keyword=${encodeURIComponent(e.name)}`;
          }

          return formatEvent({
            id: 'tm_fr_' + String(e.id),
            name: e.name,
            date: e.dates?.start?.localDate || "Date TBD",
            time: e.dates?.start?.localTime || "20:00",
            venue: venueName,
            city: cityName,
            country: "France",
            latitude: lat,
            longitude: lng,
            images: [{ url: bestImg }],
            url: ticketUrl,
            description: e.info || e.pleaseNote || "Concert officiel en direct de Ticketmaster France (ticketmaster.fr)."
          });
        })
        .filter(Boolean);

      console.log(`🌐 Ticketmaster France (ticketmaster.fr) : ${ticketmasterFormatted.length} concerts réels géolocalisés.`);
    } catch (error) {
      console.warn("⚠️ Erreur Ticketmaster API :", error.message);
    }
  }

  // 3. Concerts réels en France & Grand Est / Metz (OpenAgenda & OpenDataSoft Culture Multi-villes)
  let frenchEventsFormatted = [];
  try {
    const odsQueries = [
      // Grand Est & Région de Metz
      'where=' + encodeURIComponent('(search("concert") OR search("musique")) AND search(location_city, "Metz") AND lastdate_end >= now()') + '&limit=100',
      'where=' + encodeURIComponent('(search("concert") OR search("musique")) AND search(location_department, "Moselle") AND lastdate_end >= now()') + '&limit=100',
      'where=' + encodeURIComponent('(search("concert") OR search("musique")) AND search(location_city, "Nancy") AND lastdate_end >= now()') + '&limit=80',
      'where=' + encodeURIComponent('(search("concert") OR search("musique")) AND search(location_city, "Strasbourg") AND lastdate_end >= now()') + '&limit=80',
      'where=' + encodeURIComponent('(search("concert") OR search("musique")) AND search(location_city, "Reims") AND lastdate_end >= now()') + '&limit=80',
      // Principales métropoles de France
      'where=' + encodeURIComponent('(search("concert") OR search("musique")) AND search(location_city, "Paris") AND lastdate_end >= now()') + '&limit=100',
      'where=' + encodeURIComponent('(search("concert") OR search("musique")) AND search(location_city, "Lyon") AND lastdate_end >= now()') + '&limit=80',
      'where=' + encodeURIComponent('(search("concert") OR search("musique")) AND search(location_city, "Marseille") AND lastdate_end >= now()') + '&limit=80',
      'where=' + encodeURIComponent('(search("concert") OR search("musique")) AND search(location_city, "Lille") AND lastdate_end >= now()') + '&limit=80',
      'where=' + encodeURIComponent('(search("concert") OR search("musique")) AND search(location_city, "Bordeaux") AND lastdate_end >= now()') + '&limit=80',
      'where=' + encodeURIComponent('(search("concert") OR search("musique")) AND search(location_city, "Nantes") AND lastdate_end >= now()') + '&limit=80',
      'where=' + encodeURIComponent('(search("concert") OR search("musique")) AND search(location_city, "Toulouse") AND lastdate_end >= now()') + '&limit=80',
      'where=' + encodeURIComponent('(search("concert") OR search("musique")) AND search(location_city, "Montpellier") AND lastdate_end >= now()') + '&limit=80',
      'where=' + encodeURIComponent('(search("concert") OR search("musique")) AND search(location_city, "Rennes") AND lastdate_end >= now()') + '&limit=80',
      'where=' + encodeURIComponent('(search("concert") OR search("musique")) AND search(location_city, "Nice") AND lastdate_end >= now()') + '&limit=80',
      'where=' + encodeURIComponent('(search("concert") OR search("musique")) AND search(location_city, "Dijon") AND lastdate_end >= now()') + '&limit=80',
      'where=' + encodeURIComponent('(search("concert") OR search("musique")) AND search(location_city, "Grenoble") AND lastdate_end >= now()') + '&limit=60',
      'where=' + encodeURIComponent('(search("concert") OR search("musique")) AND search(location_city, "Rouen") AND lastdate_end >= now()') + '&limit=60',
      'where=' + encodeURIComponent('(search("concert") OR search("musique")) AND search(location_city, "Toulon") AND lastdate_end >= now()') + '&limit=60',
      'where=' + encodeURIComponent('(search("concert") OR search("musique")) AND search(location_city, "Saint-Étienne") AND lastdate_end >= now()') + '&limit=60',
      'where=' + encodeURIComponent('(search("concert") OR search("musique")) AND search(location_city, "Brest") AND lastdate_end >= now()') + '&limit=60',
      'where=' + encodeURIComponent('(search("concert") OR search("musique")) AND search(location_city, "Clermont-Ferrand") AND lastdate_end >= now()') + '&limit=60',
      'where=' + encodeURIComponent('(search("concert") OR search("musique")) AND search(location_city, "Angers") AND lastdate_end >= now()') + '&limit=60',
      // Flux national des concerts à venir (multi-pages)
      'where=' + encodeURIComponent('(search("concert") OR search("musique") OR search("festival")) AND lastdate_end >= now()') + '&limit=100&offset=0',
      'where=' + encodeURIComponent('(search("concert") OR search("musique") OR search("festival")) AND lastdate_end >= now()') + '&limit=100&offset=100',
      'where=' + encodeURIComponent('(search("concert") OR search("musique") OR search("festival")) AND lastdate_end >= now()') + '&limit=100&offset=200',
      'where=' + encodeURIComponent('(search("concert") OR search("musique")) AND lastdate_end >= now()') + '&limit=100&offset=300'
    ];

    const odsPromises = odsQueries.map(async (q) => {
      const url = `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/evenements-publics-openagenda/records?${q}`;
      try {
        const res = await fetch(url);
        if (res.ok) {
          const d = await res.json();
          return d.results || [];
        }
      } catch (e) {
        return [];
      }
      return [];
    });

    const odsResults = await Promise.allSettled(odsPromises);
    const rawOds = odsResults
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value || []);

    frenchEventsFormatted = rawOds
      .filter(r => {
        const coords = r.location_coordinates;
        const hasGps = coords && typeof coords.lat === 'number' && typeof coords.lon === 'number' && coords.lat !== 0;
        const hasName = Boolean(r.title_fr || r.title_en);
        const hasUrl = Boolean(r.canonicalurl);

        // Strict : exclure impérativement les concerts déjà terminés
        const endDate = (r.lastdate_end || r.lastdate_begin || r.firstdate_begin || "").split('T')[0];
        const isFuture = !endDate || endDate >= todayStr;

        return hasGps && hasName && hasUrl && isFuture;
      })
      .map(r => {
        // Choix de la date à venir la plus pertinente
        let eventDate = "";
        const beginDate = (r.firstdate_begin || "").split('T')[0];
        const lastDate = (r.lastdate_end || r.lastdate_begin || "").split('T')[0];
        if (beginDate && beginDate >= todayStr) {
          eventDate = beginDate;
        } else if (lastDate && lastDate >= todayStr) {
          eventDate = lastDate;
        } else {
          return null; // Événement déjà passé
        }

        const rawTime = (r.firstdate_begin || r.lastdate_begin || "");
        const timePart = rawTime.includes('T') ? rawTime.split('T')[1].substring(0, 5) : "20:00";
        const cleanDesc = (r.description_fr || r.longdescription_fr || "Concert live officiel en France.")
          .replace(/<[^>]*>/g, '')
          .substring(0, 300);

        return formatEvent({
          id: 'fr_' + String(r.uid),
          name: r.title_fr || r.title_en,
          date: eventDate,
          time: timePart,
          venue: r.location_name || "Salle de Concert",
          city: r.location_city || "France",
          country: "France",
          latitude: Number(r.location_coordinates.lat),
          longitude: Number(r.location_coordinates.lon),
          images: [{ url: r.originalimage || r.image || r.thumbnail || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80" }],
          url: r.canonicalurl,
          description: cleanDesc
        });
      })
      .filter(Boolean);

    console.log(`🇫🇷 Concerts français réels : ${frenchEventsFormatted.length}`);
  } catch (err) {
    console.warn("⚠️ Erreur OpenDataSoft Concerts :", err.message);
  }

  // Dédoublonnage et filtrage strict 100% France & ticketmaster.fr
  const mapById = new Map();
  [...localFormatted, ...ticketmasterFormatted, ...frenchEventsFormatted].forEach(evt => {
    if (!mapById.has(evt.id)) {
      mapById.set(evt.id, evt);
    }
  });

  const allEvents = Array.from(mapById.values()).filter(evt => {
    const isFrench = !evt.country || evt.country.toLowerCase().includes('france') || evt.country.toLowerCase() === 'fr';
    const isNotForeignLang = !evt.url.includes('.be') && 
                             !evt.url.includes('.de') && 
                             !evt.url.includes('.co.uk') && 
                             !evt.url.includes('.nl') && 
                             !evt.url.includes('.es') && 
                             !evt.url.includes('.it') && 
                             !evt.url.includes('.ch');

    // Filtre strict : élimine tout événement antérieur à aujourd'hui
    if (evt.date && evt.date !== "Date TBD" && evt.date !== "À venir") {
      if (evt.date < todayStr) {
        return false;
      }
    }
    return isFrench && isNotForeignLang;
  });

  // Tri chronologique des concerts à venir (du plus proche au plus lointain)
  allEvents.sort((a, b) => {
    const da = a.date || "9999-99-99";
    const db = b.date || "9999-99-99";
    return da.localeCompare(db);
  });

  console.log(`🏁 Total concerts français transmis à l'application : ${allEvents.length}`);

  cachedData = {
    localEvents: localFormatted,
    apiEvents: allEvents
  };
  lastCacheTime = Date.now();

  return cachedData;
};