import * as usersServices from './users.services.js';

export const toggleFavorite = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Vous devez être connecté." });
        }

        const { eventId } = req.body;
        const result = await usersServices.toggleFavoriteService(userId, eventId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const getProfile = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ message: "Non connecté" });

        const result = await usersServices.getUserProfile(userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};