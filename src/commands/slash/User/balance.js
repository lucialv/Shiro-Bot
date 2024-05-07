const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Usuario = require("../../../schemas/Usuario");
const GuildSchema = require("../../../schemas/GuildSchema");
const colorsEmbed = require("../../../utility/colorsEmbed");
const config = require("../../../config");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Shows your balance."),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
      if (
        config.handler.maintenance &&
        interaction.user.id != config.users.developers
      ) {
        return await interaction.reply(config.handler.maintenanceMessage);
      }
      const userId = interaction.user.id;
      const guildId = interaction.guild.id;
      const guild = await GuildSchema.findOne({ guild: guildId });
      if (!guild) {
        return await interaction.reply(
          "Tell your server administrator to run the /setup command to set up the bot"
        );
      }
      const language = guild.language;

      // Buscar al usuario en la base de datos
      const usuario = await Usuario.findOne({ idDiscord: userId });
      if (!usuario) {
        if (language === "en") {
          return await interaction.reply(
            "I couldn't find your account. Did you run the /start command?"
          );
        } else {
          return await interaction.reply(
            "No he podido encontrar tu cuenta. ¿Has hecho el comando /start?"
          );
        }
      }

      // Obtener la cantidad de dinero del usuario
      const dinero = usuario.dinero;
      if (language === "en") {
        const embed = new EmbedBuilder()
          .setTitle("Balance")
          .setDescription(`- ${dinero} 🍪`)
          .setColor(colorsEmbed["blue"])
          .setFooter({
            text: `${interaction.user.username} cookies 🍪`,
            iconURL: interaction.user.displayAvatarURL(),
          });
        await interaction.reply({ embeds: [embed.toJSON()] });
      } else {
        const embed = new EmbedBuilder()
          .setTitle("Balance")
          .setDescription(`- ${dinero} 🍪`)
          .setColor(colorsEmbed["blue"])
          .setFooter({
            text: `${interaction.user.username} galletas 🍪`,
            iconURL: interaction.user.displayAvatarURL(),
          });
        await interaction.reply({ embeds: [embed.toJSON()] });
      }
    } catch (error) {
      console.error("Error al ver el dinero:", error);
      await interaction.reply(
        "There was an error while trying to view your balance. Pls contact the developer <@300969054649450496> <3"
      );
    }
  },
};
