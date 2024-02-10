const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Usuario = require("../../../schemas/Usuario");
const Pez = require("../../../schemas/Pez");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("fishinfo")
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
      const pezIndex = interaction.options.getInteger("id") - 1;

      // Obtener el usuario y sus peces de la base de datos
      const usuario = await Usuario.findOne({ idDiscord: userId });
      if (
        !usuario ||
        !usuario.peces ||
        usuario.peces.length === 0 ||
        pezIndex < 0 ||
        pezIndex >= usuario.peces.length
      ) {
        return await interaction.reply("No tienes un pez con esa ID.");
      }

      const pez = usuario.peces[pezIndex];
      const pezInfo = await Pez.findById(pez.pezId);

      // Construir el embed con la información del pez
      const embed = new EmbedBuilder()
        .setTitle(pez.nombre)
        .setDescription(`Rareza: ${pezInfo.rareza}\nNivel: ${pez.nivel}`)
        .setColor("#FFC0CB")
        .setImage(pezInfo.foto);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error al ver el pez:", error);
      await interaction.reply("Hubo un error al intentar ver el pez.");
    }
  },
};
