import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import connectDB from './config/mongoDB.js'; 
import router from './routes/index.js'; // Le routeur principal est importé ici

const app = express();
const PORT = process.env.PORT || 5000;

// Connexion à la base de données
// connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Branchement de toutes tes routes sous le préfixe /api
app.use('/api', router);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});