const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const UserPez = require("../../../schemas/UserPez");
const Pez = require("../../../schemas/Pez");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("verpez")
    .setDescription("Muestra información detallada de un pez")
    .addIntegerOption((option) =>
      option
        .setName("id")
        .setDescription("ID del pez a visualizar")
        .setRequired(true)
    ),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
      const userId = interaction.user.id;
      const pezId = interaction.options.getInteger("id");

      // Buscar el pez del usuario en la base de datos
      const userPez = await UserPez.findOne({
        userId,
        captureCount: pezId,
      }).populate("pezId");
      if (!userPez) {
        return await interaction.reply("No tienes un pez con esa ID.");
      }

      // Obtener información del pez desde la base de datos
      const pez = userPez.pezId;

      const EmbedInfoPez = new EmbedBuilder()
        .setTitle(pez.nombre)
        .setDescription(`Rareza: ${pez.rareza}\nNivel: ${userPez.nivel}`)
        .setImage(pez.foto)
        .setColor("#FFC0CB");

      await interaction.reply({ embeds: [EmbedInfoPez] });
    } catch (error) {
      console.error("Error al ver el pez:", error);
      await interaction.reply("Hubo un error al intentar ver el pez.");
    }
  },
};
