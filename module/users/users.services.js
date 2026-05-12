import { mapper } from '../../models/index.mapper.js';

// Récupérer le profil de l'utilisateur connecté
export const getUserProfile = async (userId) => {
  const user = await mapper.user.findById(userId);
  if (!user) {
    return { success: false, message: "Utilisateur introuvable." };
  }
  return { success: true, data: user };
};

// Mettre à jour le profil
export const updateUserProfile = async (userId, data) => {
  try {
    const updatedUser = await mapper.user.update(userId, data);
    return { success: true, message: "Profil mis à jour avec succès !", data: updatedUser };
  } catch (error) {
    return { success: false, message: "Erreur lors de la mise à jour : " + error.message };
  }
};

// Supprimer le compte
export const deleteUserService = async (userId) => {
  try {
    await mapper.user.delete(userId);
    return { success: true, message: "Compte supprimé avec succès ! 😢" };
  } catch (error) {
    return { success: false, message: "Erreur BDD : " + error.message };
  }
};

// Ajouter/Retirer un favori (Toggle)
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