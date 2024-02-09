const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const UserPez = require("../../../schemas/UserPez");
const Pez = require("../../../schemas/Pez");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("mispeces")
    .setDescription("Muestra los peces que tienes en tu inventario"),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
      const userId = interaction.user.id;

      // Buscar los peces del usuario en la base de datos
      const userPeces = await UserPez.find({ userId }).populate("pezId");

      if (userPeces.length === 0) {
        return await interaction.reply(
          "No tienes ningún pez en tu inventario."
        );
      }

      // Crear un mensaje con la lista de peces del usuario
      let message = "Tienes los siguientes peces en tu inventario:\n";
      userPeces.forEach((userPez, index) => {
        message += `- ID: ${index + 1} | ${userPez.pezId.nombre} (${
          userPez.rareza
        }) (Nivel ${userPez.nivel})\n`;
      });

      await interaction.reply(message);
    } catch (error) {
      console.error("Error al consultar los peces del usuario:", error);
      await interaction.reply("Hubo un error al intentar consultar tus peces.");
    }
  },
};
