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
    .setName("coinflip")
    .setDescription("Make a coinflip to win or lose money!")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of money you want to bet")
        .setRequired(true)
    ),

  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
      if (
        config.handler.maintenance &&
        !config.users.developers.includes(interaction.user.id)
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

      const dineroApostado = interaction.options.getInteger("amount");

      //numero random entre 1 y 2
      const caraGanadora = Math.floor(Math.random() * 2) + 1 === 1;

      if (dineroApostado > usuario.dinero) {
        if (language === "en") {
          return await interaction.reply(
            "You don't have enough money to bet that amount!"
          );
        } else {
          return await interaction.reply(
            "¡No tienes suficiente dinero para apostar esa cantidad!"
          );
        }
      }

      if (dineroApostado <= 0) {
        if (language === "en") {
          return await interaction.reply("You can't bet 0 or negative money!");
        } else {
          return await interaction.reply(
            "¡No puedes apostar 0 o dinero negativo!"
          );
        }
      }

      if (caraGanadora) {
        usuario.dinero += dineroApostado;
        await usuario.save();
        const embed = new EmbedBuilder()
          .setTitle("Coinflip")
          .setDescription(
            `${
              language === "en"
                ? "You won the coinflip"
                : "¡Has ganado el coinflip!"
            } <a:check:1206885683474599936> \n ${
              language === "en" ? "You won" : "Has ganado"
            } \`${dineroApostado}\` 🍪 \n ${
              language === "en" ? "Now you have" : "Ahora tienes"
            }
            \`${usuario.dinero}\` 🍪`
          )
          .setColor(colorsEmbed["blue"])
          .setFooter({
            text: `${interaction.user.username} won a coinflip 🍪`,
            iconURL: interaction.user.displayAvatarURL(),
          });
        await interaction.reply({ embeds: [embed.toJSON()] });
      } else {
        usuario.dinero -= dineroApostado;
        await usuario.save();
        const embed = new EmbedBuilder()
          .setTitle("Coinflip")
          .setDescription(
            `${
              language === "en"
                ? "You didn't win the coinflip"
                : "¡Has perdido el coinflip!"
            } <a:failed_cross:1206884378005995521> \n ${
              language === "en" ? "You lost" : "Has perdido"
            } \`${dineroApostado}\` 🍪 \n ${
              language === "en" ? "Now you have" : "Ahora tienes"
            }
            \`${usuario.dinero}\` 🍪`
          )
          .setColor(colorsEmbed["blue"])
          .setFooter({
            text: `${interaction.user.username} ${
              language === "en" ? "lost a coinflip" : "perdió el coinflip"
            } 🍪`,
            iconURL: interaction.user.displayAvatarURL(),
          });
        await interaction.reply({ embeds: [embed.toJSON()] });
      }
    } catch (error) {
      console.error("Error al ver el dinero:", error);
      await interaction.reply(
        "There was an error while trying to do a coinflip. Pls contact the developer <@300969054649450496> <3"
      );
    }
  },
};
