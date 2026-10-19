import { mapper } from '../../models/index.mapper.js';
import bcrypt from 'bcrypt';

// Récupérer le profil de l'utilisateur connecté
export const getUserProfile = async (userId) => {
  try {
    const user = await mapper.user.findById(userId);
    if (!user) {
      return { success: false, message: "Utilisateur introuvable." };
    }
    const userObj = user.toObject ? user.toObject() : { ...user._doc };
    delete userObj.password;
    return { success: true, user: userObj, data: userObj };
  } catch (error) {
    return { success: false, message: "Erreur récupération profil : " + error.message };
  }
};

// Mettre à jour les informations du profil (nom, email, photo/avatar)
export const updateUserProfile = async (userId, data) => {
  try {
    const updateData = {};
    
    if (data.email !== undefined) {
      updateData.email = String(data.email).trim().toLowerCase();
    }
    if (data.name !== undefined) {
      updateData.name = String(data.name).trim();
    }
    if (data.avatar !== undefined) {
      updateData.avatar = String(data.avatar).trim();
    }
    if (data.favorites !== undefined && Array.isArray(data.favorites)) {
      updateData.favorites = data.favorites.map(id => String(id));
    }

    const updatedUser = await mapper.user.update(userId, updateData);
    if (!updatedUser) {
      return { success: false, message: "Utilisateur non trouvé." };
    }
    const userObj = updatedUser.toObject ? updatedUser.toObject() : { ...updatedUser._doc };
    delete userObj.password;
    return { success: true, message: "Profil mis à jour avec succès !", user: userObj, data: userObj };
  } catch (error) {
    return { success: false, message: "Erreur lors de la mise à jour : " + error.message };
  }
};

// Mettre à jour le mot de passe de l'utilisateur de manière sécurisée
export const updateUserPassword = async (userId, { currentPassword, newPassword }) => {
  try {
    if (!currentPassword || !newPassword) {
      return { success: false, message: "Le mot de passe actuel et le nouveau mot de passe sont requis." };
    }

    if (newPassword.length < 6) {
      return { success: false, message: "Le nouveau mot de passe doit contenir au moins 6 caractères." };
    }

    const user = await mapper.user.findById(userId);
    if (!user) {
      return { success: false, message: "Utilisateur non trouvé." };
    }

    // Vérifier l'ancien mot de passe
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return { success: false, message: "Le mot de passe actuel est incorrect." };
    }

    // Hasher le nouveau mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await mapper.user.update(userId, { password: hashedPassword });

    return { success: true, message: "Mot de passe modifié avec succès !" };
  } catch (error) {
    return { success: false, message: "Erreur lors de la mise à jour du mot de passe : " + error.message };
  }
};

// Synchroniser les favoris et retirer automatiquement les événements qui n'existent plus
export const syncFavoritesService = async (userId, activeEventIds) => {
  try {
    const user = await mapper.user.findById(userId);
    if (!user) return { success: false, message: "Utilisateur introuvable." };

    const currentFavorites = user.favorites || [];
    if (!Array.isArray(activeEventIds) || activeEventIds.length === 0) {
      return { success: true, favorites: currentFavorites, cleanedCount: 0 };
    }

    const validIdSet = new Set(activeEventIds.map(id => String(id)));
    // Ne garder que les favoris qui existent encore parmi les concerts actifs
    const cleanedFavorites = currentFavorites.filter(favId => validIdSet.has(String(favId)));

    const cleanedCount = currentFavorites.length - cleanedFavorites.length;

    if (cleanedCount > 0) {
      await mapper.user.update(userId, { favorites: cleanedFavorites });
      console.log(`🧹 Nettoyage favoris : ${cleanedCount} concert(s) obsolète(s) retiré(s) pour l'utilisateur ${userId}.`);
    }

    const userObj = user.toObject ? user.toObject() : { ...user._doc };
    delete userObj.password;
    userObj.favorites = cleanedFavorites;

    return {
      success: true,
      message: cleanedCount > 0 ? `${cleanedCount} événement(s) obsolète(s) retiré(s) de vos favoris.` : "Favoris à jour.",
      favorites: cleanedFavorites,
      cleanedCount,
      user: userObj
    };
  } catch (error) {
    return { success: false, message: "Erreur synchronisation favoris : " + error.message };
  }
};

// Supprimer le compte
export const deleteUserService = async (userId) => {
  try {
    await mapper.user.delete(userId);
    return { success: true, message: "Compte supprimé avec succès." };
  } catch (error) {
    return { success: false, message: "Erreur BDD : " + error.message };
  }
};

// Ajouter/Retirer un favori (Toggle)
export const toggleFavoriteService = async (userId, eventId) => {
  try {
    const user = await mapper.user.findById(userId);
    if (!user) return { success: false, message: "Utilisateur introuvable." };

    const eventIdStr = String(eventId);
    const favorites = user.favorites || [];
    const isAlreadyFavorite = favorites.some(fav => String(fav) === eventIdStr);

    let updatedFavorites;
    let message;

    if (isAlreadyFavorite) {
      updatedFavorites = favorites.filter(fav => String(fav) !== eventIdStr);
      message = "Événement retiré des favoris";
    } else {
      updatedFavorites = [...favorites, eventIdStr];
      message = "Événement ajouté aux favoris";
    }

    const updatedUser = await mapper.user.update(userId, { favorites: updatedFavorites });
    const userObj = updatedUser.toObject ? updatedUser.toObject() : { ...updatedUser._doc };
    delete userObj.password;

    return { 
      success: true, 
      message, 
      favorites: updatedFavorites, 
      user: userObj,
      data: userObj 
    };
  } catch (error) {
    return { success: false, message: "Erreur BDD : " + error.message };
  }
};