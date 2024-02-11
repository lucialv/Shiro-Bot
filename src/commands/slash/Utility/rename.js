const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const Usuario = require("../../../schemas/Usuario");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("rename")
    .setDescription("Rename a fish of your inventory")
    .addIntegerOption((option) =>
      option
        .setName("id")
        .setDescription("ID of the fish in your inventory")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("new_name")
        .setDescription("New name for the fish")
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
      const nuevoNombre = interaction.options.getString("new_name");

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

      // Marcar el pez como favorito
      const pezIndex = numeroPez - 1;
      usuario.peces[pezIndex].nombre = nuevoNombre;

      // Guardar los cambios en la base de datos
      await usuario.save();

      await interaction.reply(
        `The fish \`${numeroPez}\` has been renamed to \`${nuevoNombre}\`!`
      );
    } catch (error) {
      console.error("Error al renombrar al pez.", error);
      await interaction.reply(
        "There was an error while trying to rename the fish. Pls contact the developer <@300969054649450496> <3"
      );
    }
  },
};
