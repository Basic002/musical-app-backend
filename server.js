require('dotenv').config();
const express = require('express');
const cors = require('cors');

// On importera le routeur principal plus tard
// const router = require('./routes/index.js');
// const connectDB = require('./config/mongoDB.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globaux
app.use(cors()); // Autoriser ton frontend React à communiquer avec le back
app.use(express.json({ limit: "1mb" })); // Pour lire les body en JSON
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Initialisation de la BDD
// connectDB();

// Route de test
app.get('/', (req, res) => res.send('API Discover en ligne !'));

// Routage principal (commenté pour l'instant)
// app.use(router);

app.listen(PORT, () => {
  console.log(`Le serveur tourne sur http://localhost:${PORT}`);
});