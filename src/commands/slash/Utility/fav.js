const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const Usuario = require("../../../schemas/Usuario");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("fav")
    .setDescription("Mark a fish in your inventory as favorite")
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
      const numeroPez = interaction.options.getInteger("id");

      // Buscar al usuario en la base de datos
      const usuario = await Usuario.findOne({ idDiscord: userId });

      if (!usuario) {
        return await interaction.reply(
          "I couldn't find your account. Did you run the /start command?"
        );
      }

      // Verificar si el usuario tiene peces en su inventario
      if (!usuario.peces || usuario.peces.length === 0) {
        return await interaction.reply(
          "You don't have any fish in your inventory."
        );
      }

      // Verificar si el número del pez es válido
      if (numeroPez <= 0 || numeroPez > usuario.peces.length) {
        return await interaction.reply(
          "The fish ID you entered is invalid. Please enter a valid ID."
        );
      }

      if (usuario.peces[numeroPez - 1].favourite) {
        return await interaction.reply(
          "The fish you entered is already marked as favorite."
        );
      }

      // Marcar el pez como favorito
      const pezIndex = numeroPez - 1;
      usuario.peces[pezIndex].favourite = true;

      // Guardar los cambios en la base de datos
      await usuario.save();

      await interaction.reply(
        `The fish \`${numeroPez}\` has been marked as favorite.`
      );
    } catch (error) {
      console.error("Error al marcar el pez como favorito:", error);
      await interaction.reply(
        "There was an error while trying to mark the fish as favorite. Please contact the developer <@300969054649450496> <3"
      );
    }
  },
};
