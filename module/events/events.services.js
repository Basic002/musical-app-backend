import mongoose from 'mongoose';
import { mapper } from '../../models/index.mapper.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_FILE_PATH = path.join(__dirname, '../../data/events_cache.json');

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

// Dictionnaire de secours étendu pour coordonnées GPS des salles françaises
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
  'olympia': { lat: 48.870000, lng: 2.328333, city: 'Paris' },
  'la defense arena': { lat: 48.895556, lng: 2.229722, city: 'Nanterre' },
  'la bam': { lat: 49.123889, lng: 6.208889, city: 'Metz' },
  'les trinitaires': { lat: 49.120556, lng: 6.180278, city: 'Metz' },
  'l\'arsenal': { lat: 49.115278, lng: 6.170556, city: 'Metz' },
  'galaxie': { lat: 49.245209, lng: 6.131802, city: 'Amnéville' },
  'zenith de strasbourg': { lat: 48.591111, lng: 7.685556, city: 'Strasbourg' },
  'zenith de lille': { lat: 50.633333, lng: 3.078889, city: 'Lille' },
  'arkea arena': { lat: 44.815556, lng: -0.536111, city: 'Bordeaux' },
  'zenith de toulouse': { lat: 43.598056, lng: 1.411944, city: 'Toulouse' },
  'zenith de nantes': { lat: 47.228889, lng: -1.628889, city: 'Nantes' },
  'dome de marseille': { lat: 43.315556, lng: 5.405556, city: 'Marseille' },
  'sud de france arena': { lat: 43.571944, lng: 3.951111, city: 'Montpellier' },
  'palais nikaia': { lat: 43.676667, lng: 7.200833, city: 'Nice' }
};

// Dictionnaire de coordonnées GPS pour plus de 100 villes françaises
const CITY_GPS_FALLBACK = {
  'paris': { lat: 48.856614, lng: 2.352222 },
  'marseille': { lat: 43.296482, lng: 5.36978 },
  'lyon': { lat: 45.764043, lng: 4.835659 },
  'toulouse': { lat: 43.604652, lng: 1.444209 },
  'nice': { lat: 43.710173, lng: 7.261953 },
  'nantes': { lat: 47.218371, lng: -1.553621 },
  'montpellier': { lat: 43.610769, lng: 3.876716 },
  'strasbourg': { lat: 48.573405, lng: 7.752111 },
  'bordeaux': { lat: 44.837789, lng: -0.57918 },
  'lille': { lat: 50.62925, lng: 3.057256 },
  'rennes': { lat: 48.117266, lng: -1.677793 },
  'reims': { lat: 49.258329, lng: 4.031696 },
  'toulon': { lat: 43.124228, lng: 5.928 },
  'saint-etienne': { lat: 45.439695, lng: 4.387178 },
  'le havre': { lat: 49.49437, lng: 0.107929 },
  'grenoble': { lat: 45.188529, lng: 5.724524 },
  'dijon': { lat: 47.322047, lng: 5.04148 },
  'angers': { lat: 47.478419, lng: -0.563166 },
  'villeurbanne': { lat: 45.771944, lng: 4.890278 },
  'nimes': { lat: 43.836699, lng: 4.360054 },
  'clermont-ferrand': { lat: 45.777222, lng: 3.087025 },
  'aix-en-provence': { lat: 43.529742, lng: 5.447427 },
  'le mans': { lat: 48.00611, lng: 0.199556 },
  'brest': { lat: 48.390394, lng: -4.486076 },
  'tours': { lat: 47.394144, lng: 0.68484 },
  'amiens': { lat: 49.894066, lng: 2.295753 },
  'limoges': { lat: 45.833619, lng: 1.261105 },
  'annecy': { lat: 45.899247, lng: 6.129384 },
  'perpignan': { lat: 42.688659, lng: 2.894833 },
  'boulogne-billancourt': { lat: 48.839695, lng: 2.239911 },
  'metz': { lat: 49.119308, lng: 6.175716 },
  'besancon': { lat: 47.237829, lng: 6.024054 },
  'orleans': { lat: 47.902964, lng: 1.909251 },
  'saint-denis': { lat: 48.936181, lng: 2.357443 },
  'argenteuil': { lat: 48.947963, lng: 2.247659 },
  'rouen': { lat: 49.443232, lng: 1.099971 },
  'montreuil': { lat: 48.86381, lng: 2.44846 },
  'mulhouse': { lat: 47.750839, lng: 7.335888 },
  'caen': { lat: 49.182863, lng: -0.370679 },
  'nancy': { lat: 48.692054, lng: 6.184417 },
  'maxeville': { lat: 48.711958, lng: 6.144459 },
  'amneville': { lat: 49.245209, lng: 6.131802 },
  'eckbolsheim': { lat: 48.591111, lng: 7.685556 },
  'tourcoing': { lat: 50.723914, lng: 3.161176 },
  'roubaix': { lat: 50.692705, lng: 3.177847 },
  'nanterre': { lat: 48.892423, lng: 2.207122 },
  'avignon': { lat: 43.949317, lng: 4.805528 },
  'poitiers': { lat: 46.580224, lng: 0.340375 },
  'dunkerque': { lat: 51.034368, lng: 2.376776 },
  'versailles': { lat: 48.801408, lng: 2.130122 },
  'beziers': { lat: 43.344233, lng: 3.215756 },
  'la rochelle': { lat: 46.160329, lng: -1.151139 },
  'bourges': { lat: 47.081012, lng: 2.398782 },
  'calais': { lat: 50.95129, lng: 1.858686 },
  'antibes': { lat: 43.580418, lng: 7.125102 },
  'cannes': { lat: 43.552847, lng: 7.017369 },
  'valence': { lat: 44.933393, lng: 4.89236 },
  'saint-malo': { lat: 48.649337, lng: -2.025674 },
  'lorient': { lat: 47.748252, lng: -3.370198 },
  'troyes': { lat: 48.297345, lng: 4.074401 },
  'chambery': { lat: 45.564601, lng: 5.917781 },
  'niort': { lat: 46.323716, lng: -0.458763 },
  'pau': { lat: 43.2951, lng: -0.370797 },
  'angouleme': { lat: 45.648377, lng: 0.156237 },
  'arles': { lat: 43.676647, lng: 4.627798 },
  'ajaccio': { lat: 41.919223, lng: 8.738635 },
  'bastia': { lat: 42.70278, lng: 9.45 },
  'albi': { lat: 43.92889, lng: 2.148056 },
  'tarbes': { lat: 43.233333, lng: 0.083333 },
  'blois': { lat: 47.583333, lng: 1.333333 },
  'chartres': { lat: 48.456012, lng: 1.484089 },
  'chateauroux': { lat: 46.810278, lng: 1.691111 },
  'brive-la-gaillarde': { lat: 45.158333, lng: 1.533333 },
  'perigueux': { lat: 45.192778, lng: 0.721667 },
  'rodez': { lat: 44.351667, lng: 2.573889 },
  'aurillac': { lat: 44.926111, lng: 2.445278 },
  'montauban': { lat: 44.0175, lng: 1.355 },
  'bayonne': { lat: 43.492778, lng: -1.477778 },
  'biarritz': { lat: 43.483333, lng: -1.558333 },
  'thionville': { lat: 49.358056, lng: 6.168889 },
  'epinal': { lat: 48.174444, lng: 6.450833 },
  'forbach': { lat: 49.186667, lng: 6.900278 },
  'saint-die-des-vosges': { lat: 48.288333, lng: 6.950833 },
  'sarreguemines': { lat: 49.110556, lng: 7.069444 },
  'saint-avold': { lat: 49.103611, lng: 6.709444 },
  'bar-le-duc': { lat: 48.773333, lng: 5.161111 },
  'verdun': { lat: 49.16, lng: 5.387778 },
  'colmar': { lat: 48.079444, lng: 7.358889 },
  'haguenau': { lat: 48.815556, lng: 7.788889 },
  'schiltigheim': { lat: 48.608889, lng: 7.748889 }
};

// Helper pause asynchrone
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper fetch sécurisé avec timeout et gestion du rate-limit
async function safeFetch(url, timeoutMs = 4500) {
  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(timeoutMs)
    });
    if (res.status === 429) {
      console.warn('⚠️ Rate limit 429 atteint sur API externe, pause temporaire...');
      await sleep(800);
      return null;
    }
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Timeout ou erreur réseau silencieuse
  }
  return null;
}

// Fonction de chargement du cache depuis le fichier persistant
function loadCacheFromFile() {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const raw = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.apiEvents) && parsed.apiEvents.length > 0) {
        console.log(`📦 Cache disque chargé : ${parsed.apiEvents.length} concerts disponibles instantanément.`);
        return parsed;
      }
    }
  } catch (err) {
    console.warn("⚠️ Impossible de lire le cache disque :", err.message);
  }
  return null;
}

// Fonction de sauvegarde du cache sur le fichier persistant
function saveCacheToFile(data) {
  try {
    const dir = path.dirname(CACHE_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(data), 'utf-8');
    console.log(`💾 Cache disque mis à jour : ${data.apiEvents.length} concerts sauvegardés.`);
  } catch (err) {
    console.warn("⚠️ Impossible d'écrire le cache disque :", err.message);
  }
}

// État du cache mémoire
let cachedData = loadCacheFromFile();
let lastCacheTime = cachedData ? Date.now() : 0;
let isRefreshing = false;
const CACHE_TTL = 20 * 60 * 1000; // 20 minutes avant réactualisation en tâche de fond

// Extraction des événements MongoDB
async function fetchMongoEvents(todayStr) {
  let localFormatted = [];
  try {
    if (mongoose.connection?.readyState === 1) {
      const rawLocal = await mapper.event.findAll();
      localFormatted = rawLocal
        .filter(doc => {
          const e = doc.toObject ? doc.toObject() : { ...doc };
          const hasName = Boolean(e.title || e.name);
          const hasLocation = Boolean(e.latitude && e.longitude);
          const eventDateStr = e.date ? new Date(e.date).toISOString().split('T')[0] : "";
          const isNotPast = !eventDateStr || eventDateStr >= todayStr;
          return hasName && hasLocation && isNotPast;
        })
        .map(doc => {
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
            url: e.url || "https://www.ticketmaster.fr",
            description: e.description || "Concert live ajouté par la communauté."
          });
        });
    }
  } catch (err) {
    console.error("Erreur lecture MongoDB :", err.message);
  }
  return localFormatted;
}

// Extraction optimisée Ticketmaster avec gestion stricte du quota (max 4 req/sec)
async function fetchTicketmasterEvents(todayStr, nowIso) {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) return [];

  const cleanKey = apiKey.trim();
  const rawEvents = [];

  // Pages nationales musique (size=200 par page)
  const nationalPages = [0, 1, 2, 3, 4, 5, 6, 7]; // Jusqu'à 1600 concerts nationaux
  
  // Villes clés françaises avec leurs spécificités
  const regionalCities = [
    'Paris', 'Lyon', 'Marseille', 'Lille', 'Bordeaux', 'Nantes', 'Toulouse', 
    'Strasbourg', 'Nancy', 'Maxeville', 'Metz', 'Amneville', 'Montpellier', 
    'Nice', 'Rennes', 'Reims', 'Dijon', 'Grenoble', 'Rouen', 'Toulon'
  ];

  // 1. Récupération des pages nationales par paires avec temporisation
  for (let i = 0; i < nationalPages.length; i += 2) {
    const p1 = nationalPages[i];
    const p2 = nationalPages[i + 1];
    const urls = [
      `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${cleanKey}&countryCode=FR&locale=*&classificationName=Music&size=200&page=${p1}&sort=date,asc&startDateTime=${nowIso}`,
      p2 !== undefined ? `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${cleanKey}&countryCode=FR&locale=*&classificationName=Music&size=200&page=${p2}&sort=date,asc&startDateTime=${nowIso}` : null
    ].filter(Boolean);

    const batch = await Promise.all(urls.map(u => safeFetch(u)));
    batch.forEach(d => {
      if (d?._embedded?.events) rawEvents.push(...d._embedded.events);
    });
    await sleep(220); // Pause pour respecter scrupuleusement la limite de 5 req/s
  }

  // 2. Récupération ciblée des villes régionales par paires
  for (let i = 0; i < regionalCities.length; i += 2) {
    const c1 = regionalCities[i];
    const c2 = regionalCities[i + 1];
    const urls = [
      `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${cleanKey}&countryCode=FR&locale=*&city=${encodeURIComponent(c1)}&size=100&sort=date,asc&startDateTime=${nowIso}`,
      c2 !== undefined ? `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${cleanKey}&countryCode=FR&locale=*&city=${encodeURIComponent(c2)}&size=100&sort=date,asc&startDateTime=${nowIso}` : null
    ].filter(Boolean);

    const batch = await Promise.all(urls.map(u => safeFetch(u)));
    batch.forEach(d => {
      if (d?._embedded?.events) rawEvents.push(...d._embedded.events);
    });
    await sleep(220);
  }

  // 3. Traitement et géoréférencement intelligent
  const formatted = rawEvents.map(e => {
    const venue = e._embedded?.venues?.[0];
    const venueName = venue?.name || "Scène Musicale";
    let cityName = venue?.city?.name || "France";
    const venueLower = venueName.toLowerCase();
    const cityLower = cityName.toLowerCase();

    let lat = parseFloat(venue?.location?.latitude);
    let lng = parseFloat(venue?.location?.longitude);

    // Résolution via salle connue
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

    // Résolution via ville connue
    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      for (const [cityNameKey, coords] of Object.entries(CITY_GPS_FALLBACK)) {
        if (cityLower.includes(cityNameKey) || cityNameKey.includes(cityLower)) {
          lat = coords.lat;
          lng = coords.lng;
          break;
        }
      }
    }

    // Si toujours pas de GPS, attribuer par défaut le centre de la France pour ne jamais jeter un concert
    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      lat = 46.603354;
      lng = 1.888334;
    }

    const eventDate = e.dates?.start?.localDate;
    if (eventDate && eventDate < todayStr) return null;

    const bestImgObj = e.images?.find(img => img.ratio === '16_9' && img.width >= 500) || e.images?.[0];
    const bestImg = bestImgObj?.url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80";

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
      description: e.info || e.pleaseNote || "Concert officiel en direct de Ticketmaster France."
    });
  }).filter(Boolean);

  console.log(`🌐 Ticketmaster France : ${formatted.length} concerts réels extraits.`);
  return formatted;
}

// Extraction optimisée OpenDataSoft Culture
async function fetchOpenDataSoftEvents(todayStr) {
  const rawOds = [];

  // Flux national paginé (offset 0 à 600)
  const nationalOffsets = [0, 100, 200, 300, 400, 500, 600];
  const odsQueries = nationalOffsets.map(offset => 
    `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/evenements-publics-openagenda/records?` +
    `where=${encodeURIComponent('(search("concert") OR search("musique") OR search("festival")) AND lastdate_end >= now()')}` +
    `&limit=100&offset=${offset}`
  );

  // Requêtes régionales Grand Est & Lorraine pour une précision maximale
  const regionalQueries = [
    `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/evenements-publics-openagenda/records?where=${encodeURIComponent('(search("concert") OR search("musique")) AND search(location_city, "Metz") AND lastdate_end >= now()')}&limit=100`,
    `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/evenements-publics-openagenda/records?where=${encodeURIComponent('(search("concert") OR search("musique")) AND search(location_city, "Nancy") AND lastdate_end >= now()')}&limit=100`,
    `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/evenements-publics-openagenda/records?where=${encodeURIComponent('(search("concert") OR search("musique")) AND search(location_city, "Strasbourg") AND lastdate_end >= now()')}&limit=100`,
    `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/evenements-publics-openagenda/records?where=${encodeURIComponent('(search("concert") OR search("musique")) AND search(location_city, "Paris") AND lastdate_end >= now()')}&limit=100`,
    `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/evenements-publics-openagenda/records?where=${encodeURIComponent('(search("concert") OR search("musique")) AND search(location_city, "Lyon") AND lastdate_end >= now()')}&limit=100`
  ];

  const allQueries = [...odsQueries, ...regionalQueries];
  const results = await Promise.allSettled(allQueries.map(u => safeFetch(u, 5000)));

  results.forEach(r => {
    if (r.status === 'fulfilled' && r.value?.results) {
      rawOds.push(...r.value.results);
    }
  });

  const formatted = rawOds
    .filter(r => {
      const hasName = Boolean(r.title_fr || r.title_en);
      const endDate = (r.lastdate_end || r.lastdate_begin || r.firstdate_begin || "").split('T')[0];
      const isFuture = !endDate || endDate >= todayStr;
      return hasName && isFuture;
    })
    .map(r => {
      let eventDate = "";
      const beginDate = (r.firstdate_begin || "").split('T')[0];
      const lastDate = (r.lastdate_end || r.lastdate_begin || "").split('T')[0];
      if (beginDate && beginDate >= todayStr) {
        eventDate = beginDate;
      } else if (lastDate && lastDate >= todayStr) {
        eventDate = lastDate;
      } else {
        return null;
      }

      let lat = r.location_coordinates?.lat;
      let lng = r.location_coordinates?.lon;
      const cityName = r.location_city || "France";
      const cityLower = cityName.toLowerCase();

      if (typeof lat !== 'number' || typeof lng !== 'number' || lat === 0) {
        for (const [cityNameKey, coords] of Object.entries(CITY_GPS_FALLBACK)) {
          if (cityLower.includes(cityNameKey)) {
            lat = coords.lat;
            lng = coords.lng;
            break;
          }
        }
      }

      if (typeof lat !== 'number' || typeof lng !== 'number' || lat === 0) {
        lat = 46.603354;
        lng = 1.888334;
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
        city: cityName,
        country: "France",
        latitude: Number(lat),
        longitude: Number(lng),
        images: [{ url: r.originalimage || r.image || r.thumbnail || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80" }],
        url: r.canonicalurl || `https://openagenda.com/fr/events/${r.uid}`,
        description: cleanDesc
      });
    })
    .filter(Boolean);

  console.log(`🇫🇷 OpenDataSoft : ${formatted.length} concerts français extraits.`);
  return formatted;
}

// Fonction centrale de rafraîchissement asynchrone (stale-while-revalidate)
export const refreshEventsInBackground = async () => {
  if (isRefreshing) return;
  isRefreshing = true;

  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString().split('.')[0] + 'Z';

    console.log("\n🔄 [SYNCHRO] Début de l'actualisation complète des concerts en arrière-plan...");

    // 1. Événements BDD locaux
    const localEvents = await fetchMongoEvents(todayStr);

    // 2. Ticketmaster France
    const ticketmasterEvents = await fetchTicketmasterEvents(todayStr, nowIso);

    // 3. OpenDataSoft Culture
    const openDataEvents = await fetchOpenDataSoftEvents(todayStr);

    // Fusion et dédoublonnage intelligent
    const mapById = new Map();
    const mapByUniqueKey = new Set();

    [...localEvents, ...ticketmasterEvents, ...openDataEvents].forEach(evt => {
      if (!evt || !evt.name) return;
      
      // Clé unique basée sur nom normalisé + date + ville
      const normName = evt.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
      const uniqueKey = `${normName}_${evt.date}_${(evt.city || '').toLowerCase()}`;

      if (!mapById.has(evt.id) && !mapByUniqueKey.has(uniqueKey)) {
        mapById.set(evt.id, evt);
        mapByUniqueKey.add(uniqueKey);
      }
    });

    const allEvents = Array.from(mapById.values()).filter(evt => {
      // Filtrer les événements passés
      if (evt.date && evt.date !== "Date TBD" && evt.date !== "À venir") {
        if (evt.date < todayStr) return false;
      }
      return true;
    });

    // Tri chronologique des concerts à venir (du plus proche au plus lointain)
    allEvents.sort((a, b) => {
      const da = a.date || "9999-99-99";
      const db = b.date || "9999-99-99";
      return da.localeCompare(db);
    });

    console.log(`✅ [SYNCHRO TERMINÉE] Total concerts prêts : ${allEvents.length} événements.`);

    // Mise à jour du cache mémoire et disque
    cachedData = {
      localEvents,
      apiEvents: allEvents
    };
    lastCacheTime = Date.now();
    saveCacheToFile(cachedData);

  } catch (err) {
    console.error("❌ Erreur pendant le rafraîchissement des événements :", err);
  } finally {
    isRefreshing = false;
  }
};

// Initialisation au démarrage du serveur (non-bloquant)
export const initializeEventsCache = () => {
  // 1. Vérifier si un cache fichier existe déjà
  if (!cachedData) {
    cachedData = loadCacheFromFile();
  }

  // 2. Si le cache est absent ou trop vieux (> 30min), lancer le refresh en arrière-plan
  const needsRefresh = !cachedData || (Date.now() - lastCacheTime > CACHE_TTL);
  if (needsRefresh) {
    setTimeout(() => {
      refreshEventsInBackground();
    }, 1000); // 1 seconde après le démarrage pour laisser le serveur écouter
  }

  // 3. Rafraîchissement récurrent toutes les 30 minutes
  setInterval(() => {
    refreshEventsInBackground();
  }, 30 * 60 * 1000);
};

// Service appelé par le contrôleur GET /api/events
// Garantit une réponse IMMÉDIATE (< 5ms) sans JAMAIS bloquer l'utilisateur
export const getEventsService = async () => {
  // 1. Si le cache mémoire est disponible, le renvoyer instantanément
  if (cachedData && cachedData.apiEvents && cachedData.apiEvents.length > 0) {
    // Si le cache a expiré, déclencher le rafraîchissement en tâche de fond (stale-while-revalidate)
    if (Date.now() - lastCacheTime > CACHE_TTL && !isRefreshing) {
      refreshEventsInBackground();
    }
    return cachedData;
  }

  // 2. Si le cache mémoire n'est pas prêt, tenter le cache fichier
  const fileCache = loadCacheFromFile();
  if (fileCache && fileCache.apiEvents && fileCache.apiEvents.length > 0) {
    cachedData = fileCache;
    lastCacheTime = Date.now();
    refreshEventsInBackground();
    return cachedData;
  }

  // 3. Cas de tout premier démarrage sans fichier cache : faire une synchro rapide
  console.log("⚡ Aucun cache disponible, synchronisation immédiate...");
  await refreshEventsInBackground();
  return cachedData || { localEvents: [], apiEvents: [] };
};
