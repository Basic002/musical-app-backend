import * as authServices from './auth.services.js';

export const testAuth = (req, res) => {
  try {
    res.status(200).json({ message: "Route de test auth OK" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  }
};

export const register = async (req, res) => {
  try {
    const userData = req.body;

    const result = await authServices.registerService(userData);

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Erreur Controller Register:", error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  }
};

export const login = async (req, res) => {
  try {
    const credentials = req.body;

    const result = await authServices.loginService(credentials);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error("Erreur Controller Login:", error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  }
};