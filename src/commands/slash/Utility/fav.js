const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const Usuario = require("../../../schemas/Usuario");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("favorite")
    .setDescription("Marca un pez como favorito")
    .addIntegerOption((option) =>
      option
        .setName("numero_pez")
        .setDescription(
          "Número del pez en tu inventario a marcar como favorito"
        )
        .setRequired(true)
    ),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
      const userId = interaction.user.id;
      const numeroPez = interaction.options.getInteger("numero_pez");

      // Buscar al usuario en la base de datos
      const usuario = await Usuario.findOne({ idDiscord: userId });

      if (!usuario) {
        return await interaction.reply("No se pudo encontrar al usuario.");
      }

      // Verificar si el usuario tiene peces en su inventario
      if (!usuario.peces || usuario.peces.length === 0) {
        return await interaction.reply("Tu inventario de peces está vacío.");
      }

      // Verificar si el número del pez es válido
      if (numeroPez <= 0 || numeroPez > usuario.peces.length) {
        return await interaction.reply(
          "El número de pez especificado no es válido."
        );
      }

      // Marcar el pez como favorito
      const pezIndex = numeroPez - 1;
      usuario.peces[pezIndex].favourite = true;

      // Guardar los cambios en la base de datos
      await usuario.save();

      await interaction.reply(
        `El pez número \`${numeroPez}\` ha sido marcado como favorito.`
      );
    } catch (error) {
      console.error("Error al marcar el pez como favorito:", error);
      await interaction.reply(
        "Hubo un error al intentar marcar el pez como favorito."
      );
    }
  },
};
