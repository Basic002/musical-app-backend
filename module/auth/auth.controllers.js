import * as authServices from './auth.services.js';

export const register = async (req, res) => {
    try {
        const result = await authServices.registerService(req.body);
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur interne" });
    }
};

export const login = async (req, res) => {
    try {
        const result = await authServices.loginService(req.body);
        if (result.success) {
            req.session.userId = result.user._id;
            
            res.status(200).json({ 
                success: true, 
                message: "Connexion réussie !", 
                user: result.user 
            });
        } else {
            res.status(401).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur interne" });
    }
};

export const logout = (req, res) => {
    req.session.destroy();
    res.status(200).json({ message: "Déconnexion réussie" });
};