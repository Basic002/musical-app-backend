import { mapper } from '../../models/index.mapper.js';

export const registerService = async (userData) => {
  try {
    const existingUser = await mapper.user.findByEmail(userData.email);
    if (existingUser) {
      return { success: false, message: "Cet email est déjà utilisé." };
    }
    const newUser = await mapper.user.create(userData);

    return {
      success: true,
      message: "Utilisateur créé avec succès !",
      user: newUser
    };

  } catch (error) {
    return {
      success: false,
      message: "Erreur lors de la création : " + error.message
    };
  }
};

export const loginService = async (userData) => {
  try {
    const user = await mapper.user.findByEmail(userData.email);

    if (!user) {
      return { success: false, message: "Utilisateur introuvable." };
    }

    if (user.password !== userData.password) {
      return { success: false, message: "Mot de passe incorrect." };
    }

    return {
      success: true,
      message: "Connexion réussie !",
      user: user
    };
  } catch (error) {
    return {
      success: false,
      message: "Erreur lors de la connexion : " + error.message
    };
  }
};