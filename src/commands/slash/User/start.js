const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Usuario = require("../../../schemas/Usuario");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("start")
    .setDescription("Starts your adventure in the fishing world"),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
      const userId = interaction.user.id;

      // Buscar al usuario en la base de datos
      let usuario = await Usuario.findOne({ idDiscord: userId });
      if (usuario) {
        return await interaction.reply("You already have an account!");
      } else {
        usuario = await Usuario.create({
          idDiscord: userId,
          nombre: interaction.user.username,
          dinero: 250,
          inventario: [],
          donator: false,
          capturados: 0,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle("Welcome to the fishing world!")
        .setDescription(
          `I've created your account. You have \`250\` 🍪 to start with! Why you don't try to buy a rod? \`/buy 1\``
        )
        .setColor("#FFC0CB")
        .setFooter({
          text: `${interaction.user.username} welcome 🎣`,
          iconURL: interaction.user.displayAvatarURL(),
        });
      await interaction.reply({ embeds: [embed.toJSON()] });
    } catch (error) {
      console.error("Error al empezar una cuenta", error);
      await interaction.reply(
        "There was an error while trying to start you an account. Pls contact the developer <@300969054649450496> <3"
      );
    }
  },
};
