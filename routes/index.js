const express = require('express');
const router = express.Router();

// On importera les routes des modules ici :
// const authRouter = require('../module/auth/auth.routes');
// const eventsRouter = require('../module/events/events.routes');

// router.use('/auth', authRouter);
// router.use('/events', eventsRouter);

// Gestion de l'erreur 404 (Route non trouvée)
router.use((req, res) => {
  res.status(404).json({ error: "Route introuvable" });
});

module.exports = router;