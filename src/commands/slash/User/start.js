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
    .setName("start")
    .setDescription("Starts your adventure in the fishing world"),
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
      let usuario = await Usuario.findOne({ idDiscord: userId });
      if (usuario) {
        if (language === "en") {
          return await interaction.reply("You already have an account!");
        } else {
          return await interaction.reply("¡Ya tienes una cuenta!");
        }
      } else {
        usuario = await Usuario.create({
          idDiscord: userId,
          nombre: interaction.user.username,
          dinero: 250,
          inventario: [],
          donator: false,
          capturados: 0,
          peces: [],
          badges: [],
        });
      }

      const embed = new EmbedBuilder()
        .setTitle(
          language === "en"
            ? "Welcome to the fishing world!"
            : "Bienvenido/a al mundo de la pesca!"
        )
        .setDescription(
          language === "en"
            ? "I've created your account. You have `250` 🍪 to start with! Why you don't try to buy a rod? `/buy 1`"
            : "He creado tu cuenta. ¡Tienes `250` 🍪 para empezar! ¿Por qué no intentas comprar una caña? `/buy 1`"
        )
        .setColor(colorsEmbed["blue"])
        .setFooter({
          text: `${interaction.user.username} ${
            language === "en" ? "welcome" : "bienvenid@"
          }  🎣`,
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
