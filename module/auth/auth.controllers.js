import * as authServices from './auth.services.js';
import { createToken } from '../../config/token.js';

export const register = async (req, res) => {
    try {
        const result = await authServices.registerService(req.body);
        if (result.success) {
            const token = createToken(result.user?._id);
            res.status(201).json({ ...result, token });
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Erreur contrôleur register :", error);
        res.status(500).json({ success: false, message: error.message || "Erreur interne" });
    }
};

export const login = async (req, res) => {
    try {
        const result = await authServices.loginService(req.body);
        if (result.success) {
            req.session.userId = result.user._id;
            const token = createToken(result.user._id);

            // Sauvegarde explicite de la session avant d'émettre la réponse HTTP
            req.session.save((err) => {
                if (err) {
                    console.error("Erreur lors de la sauvegarde de la session :", err);
                    return res.status(500).json({ success: false, message: "Erreur d'initialisation de session" });
                }
                res.status(200).json({ 
                    success: true, 
                    message: "Connexion réussie !", 
                    user: result.user,
                    token: token
                });
            });
        } else {
            res.status(401).json(result);
        }
    } catch (error) {
        console.error("Erreur contrôleur login :", error);
        res.status(500).json({ success: false, message: error.message || "Erreur interne" });
    }
};

export const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Erreur lors de la déconnexion" });
        }
        res.clearCookie('musical_app_sid'); 
        res.clearCookie('connect.sid'); 
        return res.status(200).json({ success: true, message: "Déconnexion réussie" });
    });
};