const testEventsService = () => {
  console.log("Le service Events a été appelé !");
  return { success: true, message: "Service Événements opérationnel" };
};

module.exports = {
  testEventsService
};