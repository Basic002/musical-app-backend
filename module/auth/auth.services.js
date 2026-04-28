export const registerUser = (userData) => {
  console.log("Service Auth : Demande d'inscription reçue", userData);
  // Plus tard : on vérifiera si l'email existe déjà, on hachera le mot de passe, et on sauvera en BDD.
  return { success: true, message: "Utilisateur créé avec succès (Simulation)" };
};

export const loginUser = (credentials) => {
  console.log("Service Auth : Tentative de connexion pour", credentials?.email);
  // Plus tard : on cherchera l'utilisateur en BDD, on vérifiera le mot de passe, et on générera un vrai token JWT.
  if (credentials?.email && credentials?.password) {
    return { success: true, token: "faux_token_jwt_12345", message: "Connexion réussie" };
  }
  return { success: false, message: "Email ou mot de passe manquant" };
};