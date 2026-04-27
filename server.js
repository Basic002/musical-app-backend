import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import connectDB from './config/mongoDB.js'; 

// On commentera ces lignes jusqu'à ce que les routes soient prêtes (Jeudi)
// import router from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 5000;

// connectDB();

app.use(cors());
app.use(express.json());

// On commente aussi l'utilisation du routeur
// app.use('/api', router);

// Petite route de test basique en attendant
app.get('/', (req, res) => res.send('API Discover en ligne (Version ESM) !'));

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});