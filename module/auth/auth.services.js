import { mapper } from '../../models/index.mapper.js';
import bcrypt from 'bcrypt';

export const registerService = async (userData) => {
  try {
    const { name, email, password } = userData;

    if (!name || !email || !password) {
      return { success: false, message: "Tous les champs (nom, email, mot de passe) sont obligatoires." };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (password.length < 6) {
      return { success: false, message: "Le mot de passe doit contenir au moins 6 caractères." };
    }

    const existingUser = await mapper.user.findByEmail(cleanEmail);
    if (existingUser) {
      return { success: false, message: "Cet email est déjà associé à un compte." };
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await mapper.user.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      favorites: []
    });

    if (!newUser) {
      return { success: false, message: "Impossible de créer le compte utilisateur." };
    }

    // On supprime le mot de passe hashé de l'objet renvoyé
    const userObj = newUser.toObject ? newUser.toObject() : { ...newUser._doc };
    delete userObj.password;

    return { success: true, message: "Compte créé avec succès !", user: userObj };
  } catch (error) {
    console.error("Erreur registerService :", error);
    return { success: false, message: error.message || "Erreur lors de l'enregistrement" };
  }
};

export const loginService = async (userData) => {
  try {
    const { email, password } = userData;

    if (!email || !password) {
      return { success: false, message: "Email et mot de passe requis." };
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await mapper.user.findByEmail(cleanEmail);
    if (!user) {
      return { success: false, message: "Identifiants incorrects." };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, message: "Identifiants incorrects." };
    }

    // On supprime le mot de passe hashé de l'objet renvoyé
    const userObj = user.toObject ? user.toObject() : { ...user._doc };
    delete userObj.password;

    return { success: true, user: userObj };
  } catch (error) {
    console.error("Erreur loginService :", error);
    return { success: false, message: error.message || "Erreur lors de la connexion" };
  }
};