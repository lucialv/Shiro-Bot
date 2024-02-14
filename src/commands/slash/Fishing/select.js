const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const Usuario = require("../../../schemas/Usuario");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("select")
    .setDescription(
      "Select a fish from your inventory to level up while fishing."
    )
    .addIntegerOption((option) =>
      option
        .setName("id")
        .setDescription("Id of the fish in your inventory")
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

      // Verificar si el pez ya está seleccionado
      if (usuario.peces[numeroPez - 1].selected) {
        usuario.peces[numeroPez - 1].selected = false;
        await usuario.save();
        return await interaction.reply("The fish has been unselected.");
      }

      // Marcar el pez como favorito
      const pezIndex = numeroPez - 1;
      usuario.peces[pezIndex].selected = true;

      // Guardar los cambios en la base de datos
      await usuario.save();

      await interaction.reply(
        `The fish \`${
          usuario.peces[numeroPez - 1].nombre
        }\` has been selected. You can now level up this fish while fishing.`
      );
    } catch (error) {
      console.error("Error al seleccionar pez:", error);
      await interaction.reply(
        "There was an error while trying to select the fish. Pls contact the developer <@300969054649450496> <3"
      );
    }
  },
};
