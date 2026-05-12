import { mapper } from '../../models/index.mapper.js';
import bcrypt from 'bcrypt';

export const registerService = async (userData) => {
  try {
    const existingUser = await mapper.user.findByEmail(userData.email);
    if (existingUser) return { success: false, message: "Cet email est déjà utilisé." };

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    const newUser = await mapper.user.create({
      ...userData,
      password: hashedPassword
    });

    if (!newUser) return { success: false, message: "Erreur lors de la création." };
    return { success: true, message: "Utilisateur créé !", user: newUser };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const loginService = async (userData) => {
  try {
    const user = await mapper.user.findByEmail(userData.email);
    if (!user) return { success: false, message: "Identifiants incorrects." };

    const isMatch = await bcrypt.compare(userData.password, user.password);

    if (!isMatch) {
      return { success: false, message: "Identifiants incorrects." };
    }

    return { success: true, user };
  } catch (error) {
    return { success: false, message: error.message };
  }
};