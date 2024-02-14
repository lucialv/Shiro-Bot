const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
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
          "I couldn't find your account. Did you run the /start command?"
        );
      }

      // Obtener la cantidad de dinero del usuario
      const dinero = usuario.dinero;
      const embed = new EmbedBuilder()
        .setTitle("Balance")
        .setDescription(`- ${dinero} 🍪`)
        .setColor("#FFC0CB")
        .setFooter({
          text: `${interaction.user.username} cookies 🍪`,
          iconURL: interaction.user.displayAvatarURL(),
        });
      await interaction.reply({ embeds: [embed.toJSON()] });
    } catch (error) {
      console.error("Error al ver el dinero:", error);
      await interaction.reply(
        "There was an error while trying to view your balance. Pls contact the developer <@300969054649450496> <3"
      );
    }
  },
};
