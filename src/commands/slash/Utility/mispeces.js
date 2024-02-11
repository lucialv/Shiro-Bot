const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const Usuario = require("../../../schemas/Usuario");

// Definir emojis para cada rareza
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
    .setName("fishes")
    .setDescription("Shows the fishes in your inventory"),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
      const userId = interaction.user.id;

      // Buscar al usuario en la base de datos
      const usuario = await Usuario.findOne({ idDiscord: userId });

      if (!usuario || usuario.peces.length === 0) {
        return await interaction.reply(
          "You don't have any fish in your inventory."
        );
      }
      const embed = new EmbedBuilder()
        .setTitle("Inventory 🎣")
        .setDescription("You have the following fishes in your inventory:")
        .setFooter({
          text: `${interaction.user.username} fishes 🐟`,
          iconURL: interaction.user.displayAvatarURL(),
        });
      // Crear un mensaje con la lista de peces del usuario
      let description = "You have the following fishes in your inventory:\n";

      usuario.peces.forEach((pez, index) => {
        // Obtener el emoji correspondiente a la rareza del pez
        const rarezaEmoji = rarezaEmojis[pez.rareza] || "";
        const generoEmoji = generoEmojis[pez.genero] || "";

        // Agregar la cadena de texto si el pez está marcado como favorito
        const favoritoText = pez.favourite
          ? " <:heartyy:1205896133277253694>"
          : "";

        // Agregar el pez al mensaje con su rareza, emoji y cadena de texto de favorito
        description += `- ID: \`${index + 1}\` | ${
          pez.nombre
        } ${generoEmoji} ${rarezaEmoji} Level ${pez.nivel} ${favoritoText}\n`;
      });
      embed.setDescription(description);

      await interaction.reply({ embeds: [embed.toJSON()] });
    } catch (error) {
      console.error("Error al consultar los peces del usuario:", error);
      await interaction.reply(
        "There was an error while trying to view your fishes. Pls contact the developer <@300969054649450496> <3"
      );
    }
  },
};
