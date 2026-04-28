import * as usersServices from './users.services.js';

export const testUsers = (req, res) => {
    try {
        const result = usersServices.testUsersService();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur interne du serveur" });
    }
};

export const getProfile = (req, res) => {
    try {
        const userId = req.params.id;
        const result = usersServices.getUserProfile(userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur interne du serveur" });
    }
};

export const getFavorites = (req, res) => {
    try {
        const userId = req.params.id;
        const result = usersServices.getUserFavorites(userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur interne du serveur" });
    }
};