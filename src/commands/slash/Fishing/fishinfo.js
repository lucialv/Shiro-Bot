const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Usuario = require("../../../schemas/Usuario");
const Pez = require("../../../schemas/Pez");
const expUntilNextLevel = require("../../../utility/expUntilNextLevel");

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
        return await interaction.reply("You don't have a fish with that ID.");
      }

      const pez = usuario.peces[pezIndex];
      const pezInfo = await Pez.findById(pez.pezId);

      // Construir el embed con la información del pez
      const embed = new EmbedBuilder()
        .setTitle(pez.nombre)
        .setDescription(
          `Rarity: ${pezInfo.rareza}\nLevel: ${pez.nivel} \nExp: ${pez.exp} / ${
            expUntilNextLevel[pez.nivel]
          } \nFavorite: ${pez.favourite ? "Sí" : "No"}`
        )
        .setTimestamp()
        .setFooter({
          text: `${interaction.user.username} ${pezIndex + 1} fish 🎣`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setColor("#FFC0CB")
        .setImage(pezInfo.foto);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error al ver el pez:", error);
      await interaction.reply(
        "There was an error trying to see your fish. Pls contact the developer <@300969054649450496> <3"
      );
    }
  },
};
