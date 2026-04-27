const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("✅ Connecté à MongoDB avec succès !");
  } catch (error) {
    console.error("❌ Échec de la connexion à MongoDB :", error);
    process.exit(1);
  }
};

module.exports = connectDB;