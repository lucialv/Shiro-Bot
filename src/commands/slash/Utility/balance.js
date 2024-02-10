const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Usuario = require("../../../schemas/Usuario");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Muestra la cantidad de dinero que tienes"),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
      const userId = interaction.user.id;

      // Buscar al usuario en la base de datos
      const usuario = await Usuario.findOne({ idDiscord: userId });
      if (!usuario) {
        return await interaction.reply(
          "No se encontró información sobre tu cuenta."
        );
      }

      // Obtener la cantidad de dinero del usuario
      const dinero = usuario.dinero;

      await interaction.reply(`Tienes ${dinero} monedas.`);
    } catch (error) {
      console.error("Error al ver el dinero:", error);
      await interaction.reply("Hubo un error al intentar ver tu dinero.");
    }
  },
};
