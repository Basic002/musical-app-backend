import { mapper } from '../../models/index.mapper.js';

// Récupérer un profil
export const getUserProfile = async (userId) => {
    const user = await mapper.user.findById(userId);
    if (!user) {
        return { success: false, message: "Utilisateur introuvable." };
    }
    return { success: true, data: user };
};

// Mettre à jour un profil
export const updateUserProfile = async (userId, data) => {
    const updatedUser = await mapper.user.update(userId, data);
    return { success: true, message: "Profil mis à jour avec succès !", data: updatedUser };
};

// Ajouter/Retirer un favori (Celle qu'on a faite tout à l'heure)
export const toggleFavoriteService = async (userId, eventId) => {
    try {
        const user = await mapper.user.findById(userId);
        if (!user) return { success: false, message: "Utilisateur introuvable." };

        const isAlreadyFavorite = user.favorites.some(fav => fav.toString() === eventId);

        if (isAlreadyFavorite) {
            user.favorites = user.favorites.filter(fav => fav.toString() !== eventId);
            await mapper.user.update(userId, { favorites: user.favorites });
            return { success: true, message: "Événement retiré des favoris 💔" };
        } else {
            user.favorites.push(eventId);
            await mapper.user.update(userId, { favorites: user.favorites });
            return { success: true, message: "Événement ajouté aux favoris ❤️" };
        }
    } catch (error) {
        return { success: false, message: "Erreur BDD : " + error.message };
    }
};