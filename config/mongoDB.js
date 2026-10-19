import mongoose from 'mongoose';

// Ne jamais geler les requêtes HTTP si MongoDB est en attente ou injoignable
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn("⚠️ MONGO_URI non définie, connexion BDD en attente...");
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`🟢 MongoDB Connecté : ${conn.connection.host}`);
  } catch (error) {
    console.error(`🔴 Erreur de connexion MongoDB : ${error.message}`);
    // Ne pas crasher le serveur pour que l'API reste en ligne
  }
};

export default connectDB;