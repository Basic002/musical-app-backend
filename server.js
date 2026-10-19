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

// Détection de l'environnement de production
const isProd = process.env.NODE_ENV === 'production';
if (isProd) {
  app.set('trust proxy', 1);
}

// CORS permissif pour le dev local et les plateformes de déploiement en ligne
const allowedOrigins = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [];
app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin || 
      origin.startsWith('http://localhost') || 
      origin.startsWith('http://127.0.0.1') || 
      allowedOrigins.includes(origin) ||
      !isProd ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.netlify.app') ||
      origin.endsWith('.onrender.com')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Origine non autorisée par CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Configuration de la Session Express
app.use(session({
  name: 'musical_app_sid',
  secret: process.env.SESSION_SECRET || 'musical_app_secret_goth_vibes_2026', 
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: isProd, // true en HTTPS de production
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 jours
  }
}));

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