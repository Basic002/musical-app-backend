import * as usersServices from './users.services.js';

export const getProfile = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ success: false, message: "Non connecté" });

        const result = await usersServices.getUserProfile(userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ success: false, message: "Non connecté" });

        const result = await usersServices.updateUserProfile(userId, req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ success: false, message: "Non connecté" });

        const result = await usersServices.deleteUserService(userId);

        if (result.success) {
            req.session.destroy();
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const toggleFavorite = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ success: false, message: "Non connecté" });

        const { eventId } = req.body;
        const result = await usersServices.toggleFavoriteService(userId, eventId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const updatePassword = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ success: false, message: "Non connecté" });

        const result = await usersServices.updateUserPassword(userId, req.body);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur : " + error.message });
    }
};

export const syncFavorites = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ success: false, message: "Non connecté" });

        const { activeEventIds } = req.body;
        const result = await usersServices.syncFavoritesService(userId, activeEventIds);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur : " + error.message });
    }
};