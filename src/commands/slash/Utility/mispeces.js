const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Usuario = require("../../../schemas/Usuario");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("fishes")
    .setDescription("Muestra los peces que tienes en tu inventario"),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
      const userId = interaction.user.id;

      // Buscar al usuario en la base de datos
      const usuario = await Usuario.findOne({ idDiscord: userId });

      if (!usuario || usuario.peces.length === 0) {
        return await interaction.reply(
          "No tienes ningún pez en tu inventario."
        );
      }

      // Crear un mensaje con la lista de peces del usuario
      let message = "Tienes los siguientes peces en tu inventario:\n";
      usuario.peces.forEach((pez, index) => {
        message += `- ID: \`${index + 1}\` | ${pez.nombre} (${
          pez.rareza
        }) (Nivel ${pez.nivel})\n`;
      });

      await interaction.reply(message);
    } catch (error) {
      console.error("Error al consultar los peces del usuario:", error);
      await interaction.reply("Hubo un error al intentar consultar tus peces.");
    }
  },
};
