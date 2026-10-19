import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import connectDB from './config/mongoDB.js';
import router from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connexion BDD
connectDB();

// Détection de l'environnement de production ou hébergement cloud
const isProd = process.env.NODE_ENV === 'production' || !!process.env.RENDER;

// Toujours faire confiance au proxy pour HTTPS sur Render / Cloudflare
app.set('trust proxy', 1);

// CORS universel et permissif pour le dev local, GitHub Pages et plateformes cloud
const allowedOrigins = [
  'https://basic002.github.io',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ''));
}

app.use(cors({
  origin: (origin, callback) => {
    // Si pas d'origine (ex: curl, postman, SSR, requêtes serveur à serveur), autoriser
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, '');

    // Autoriser explicitement les origines autorisées et les domaines GitHub Pages / Render / Localhost
    if (
      cleanOrigin.startsWith('http://localhost') ||
      cleanOrigin.startsWith('http://127.0.0.1') ||
      cleanOrigin.endsWith('github.io') ||
      cleanOrigin.includes('github.io') ||
      cleanOrigin.endsWith('onrender.com') ||
      cleanOrigin.endsWith('vercel.app') ||
      cleanOrigin.endsWith('netlify.app') ||
      allowedOrigins.includes(cleanOrigin)
    ) {
      return callback(null, true);
    }

    // Autoriser pour éviter tout blocage utilisateur
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Répondre directement aux requêtes préliminaires OPTIONS (preflight CORS)
// Note: Dans Express 5, app.use(cors(...)) intercepte déjà automatiquement toutes les requêtes OPTIONS sans avoir besoin de app.options('*')

app.use(express.json());

// Configuration de la Session Express
app.use(session({
  name: 'musical_app_sid',
  secret: process.env.SESSION_SECRET || 'musical_app_secret_goth_vibes_2026', 
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: { 
    secure: isProd, // true en HTTPS de production
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax', // 'none' obligatoire pour cross-site github.io -> onrender.com
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 jours
  }
}));

// Import du gestionnaire de jetons hybrides pour les navigateurs qui bloquent les cookies tiers
import { verifyToken } from './config/token.js';

// Middleware d'authentification hybride (Session Cookie + Bearer Token)
app.use((req, res, next) => {
  if (!req.session) {
    req.session = {};
  }
  if (!req.session.userId) {
    const authHeader = req.headers.authorization || req.headers['x-auth-token'];
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      const verifiedUserId = verifyToken(token);
      if (verifiedUserId) {
        req.session.userId = verifiedUserId;
      }
    }
  }
  next();
});

// Route de santé API (ping)
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: "API opérationnelle ✦", session: !!req.session?.userId });
});

// Branchement des routes principales
app.use('/api', router);

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error("Erreur serveur non interceptée :", err);
  res.status(500).json({ success: false, message: err.message || "Erreur interne du serveur" });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🦇 Serveur démarré sur http://127.0.0.1:${PORT} et http://localhost:${PORT}`);
});