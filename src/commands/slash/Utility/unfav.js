const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const Usuario = require("../../../schemas/Usuario");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("unfav")
    .setDescription("Desmarca un pez como favorito")
    .addIntegerOption((option) =>
      option
        .setName("numero_pez")
        .setDescription(
          "Número del pez en tu inventario a desmarcar como favorito"
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

      if (usuario.peces[numeroPez - 1].favourite === false) {
        return await interaction.reply(
          "El pez seleccionado no está marcado como favorito."
        );
      }

      // Marcar el pez como favorito
      const pezIndex = numeroPez - 1;
      usuario.peces[pezIndex].favourite = false;

      // Guardar los cambios en la base de datos
      await usuario.save();

      await interaction.reply(
        `El pez número \`${numeroPez}\` ha sido desmarcado como favorito.`
      );
    } catch (error) {
      console.error("Error al desmarcar el pez como favorito:", error);
      await interaction.reply(
        "Hubo un error al intentar desmarcar el pez como favorito."
      );
    }
  },
};
