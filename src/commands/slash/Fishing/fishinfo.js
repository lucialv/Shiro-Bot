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

const rarezaEmojis = {
  Common:
    "<:common1:1205868965226618980><:common2:1205868966648479824><:common3:1205868967889993759><:common4:1205868968850624634>",
  Rare: "<:rare1:1205877104768716830><:rare2:1205877105875886160><:rare3:1205877106983043113>",
  "Very rare":
    "<:very_rare1:1205877417235709953><:very_rare2:1205877418871623712><:very_rare3:1205877420062675015><:very_rare4:1205877420889215048>",
  Epic: "<:epic1:1205877519958544395><:epic2:1205877521241874492><:epic3:1205877522609213460>",
  Legendary:
    "<:legendary1:1205880191079940107><:legendary2:1205880192451485766><:legendary3:1205880193340801085><:legendary4:1205880194993233940><:legendary5:1205880196180484117><:legendary6:1205880197090639883><:legendary7:1205880198680285186>",
  Mitic:
    "<:mitic1:1205881199545811046><:mitic2:1205881200695316480><:mitic3:1205881201970126868><:mitic4:1205881207653670973><:mitic5:1205881208878145566>",
};

const generoEmojis = {
  Boy: "<:male:1205911279714435143>",
  Girl: "<:female:1205911278791430204>",
};

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
        .setTitle(
          pez.renamed
            ? `${pez.renamed} | (${pezInfo.nombre}) ${
                pez.generoEmojis[pez.genero]
              }`
            : pezInfo.nombre + " " + pez.generoEmojis[pez.genero]
        )
        .setDescription(
          `${language === "en" ? "Rarity" : "Rareza"}:  ${
            rarezaEmojis[pezInfo.rareza]
          }\n${language === "en" ? "Level" : "Nivel"}: ${pez.nivel} \nExp: ${
            pez.exp
          } / ${expUntilNextLevel[pez.nivel]} \n${
            language === "en" ? "Favorite" : "Favorito"
          }: ${pez.favourite ? `${language === "en" ? "Yes" : "Sí"}` : "No"}`
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
