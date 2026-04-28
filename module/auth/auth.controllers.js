import * as authServices from './auth.services.js';

export const testAuth = (req, res) => {
  try {
    const result = authServices.testAuthService();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  }
};

export const register = (req, res) => {
  try {
    const userData = req.body; // On récupère les infos envoyées par le front
    const result = authServices.registerUser(userData);
    res.status(201).json(result); // Créé avec succès
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  }
};

export const login = (req, res) => {
  try {
    const credentials = req.body;
    const result = authServices.loginUser(credentials);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  }
};