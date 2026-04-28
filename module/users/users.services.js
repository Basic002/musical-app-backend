export const getUserProfile = (userId) => {
  console.log(`Service Users : Récupération du profil ${userId}`);
  // Plus tard : return await User.findById(userId).select('-password');
  return { id: userId, name: "Enzo", email: "enzo@test.com" };
};

export const getUserFavorites = (userId) => {
  console.log(`Service Users : Récupération des favoris de ${userId}`);
  // Plus tard : on ira chercher dans la collection Favorites ou dans le tableau de l'utilisateur
  return [
    { id: 1, artist: "Arctic Monkeys", venue: "Accor Arena, Paris" }
  ];
};