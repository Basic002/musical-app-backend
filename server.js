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

app.use(cors());
app.use(express.json());

// Configuration de la Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'musical_app_secret_key', 
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// Routes
app.use('/api', router);

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});