import { mapper } from '../../models/index.mapper.js';

export const registerService = async (userData) => {
  try {
    const existingUser = await mapper.user.findByEmail(userData.email);
    if (existingUser) {
      return { success: false, message: "Cet email est déjà utilisé." };
    }

    const newUser = await mapper.user.create(userData);

    if (!newUser) {
      return { success: false, message: "Échec de la création de l'utilisateur en base de données." };
    }

    return {
      success: true,
      message: "Utilisateur créé avec succès !",
      user: newUser
    };

  } catch (error) {
    return { success: false, message: "Erreur lors de la création : " + error.message };
  }
};

export const loginService = async (userData) => {
  try {
    const user = await mapper.user.findByEmail(userData.email);
    if (!user || user.password !== userData.password) {
      return { success: false, message: "Identifiants incorrects." };
    }
    return { success: true, user };
  } catch (error) {
    return { success: false, message: "Erreur connexion : " + error.message };
  }
};