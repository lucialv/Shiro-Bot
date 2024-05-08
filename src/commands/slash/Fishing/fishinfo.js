const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Usuario = require("../../../schemas/Usuario");
const Pez = require("../../../schemas/Pez");
const expUntilNextLevel = require("../../../utility/expUntilNextLevel");
const colorsEmbed = require("../../../utility/colorsEmbed");
const GuildSchema = require("../../../schemas/GuildSchema");
const config = require("../../../config");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("fishinfo")
    .setDescription("Shows information about a fish in your inventory")
    .addIntegerOption((option) =>
      option
        .setName("id")
        .setDescription("ID of the fish in your inventory")
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
        return await interaction.reply(
          language === "en"
            ? "You don't have any fish in your inventory."
            : "No tienes ningún pez en tu inventario."
        );
      }

      const pez = usuario.peces[pezIndex];
      const pezInfo = await Pez.findById(pez.pezId);

      // Construir el embed con la información del pez
      const embed = new EmbedBuilder()
        .setTitle(pez.nombre)
        .setDescription(
          `${language === "en" ? "Rarity" : "Rareza"}: ${pezInfo.rareza}\n${
            language === "en" ? "Level" : "Nivel"
          }: ${pez.nivel} \nExp: ${pez.exp} / ${
            expUntilNextLevel[pez.nivel]
          } \n${language === "en" ? "Favorite" : "Favorito"}: ${
            pez.favourite ? `${language === "en" ? "Yes" : "Sí"}` : "No"
          }`
        )
        .setTimestamp()
        .setFooter({
          text: `${interaction.user.username} ${
            language === "en" ? "fish" : "pez"
          } 🎣`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setColor(colorsEmbed["blue"]);
      // .setImage(pezInfo.foto);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error al ver el pez:", error);
      await interaction.reply(
        "There was an error trying to see your fish. Pls contact the developer <@300969054649450496> <3"
      );
    }
  },
};
