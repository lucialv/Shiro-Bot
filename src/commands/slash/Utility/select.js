const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const Usuario = require("../../../schemas/Usuario");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("select")
    .setDescription(
      "Selecciona un pez para poder subirlo de nivel y que te acompañe en tus aventuras."
    )
    .addIntegerOption((option) =>
      option
        .setName("numero_pez")
        .setDescription("Número del pez en tu inventario a seleccionar")
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

      // Verificar si el pez ya está seleccionado
      if (usuario.peces[numeroPez - 1].selected) {
        usuario.peces[numeroPez - 1].selected = false;
        await usuario.save();
        return await interaction.reply("Has deseleccionado el pez.");
      }

      // Marcar el pez como favorito
      const pezIndex = numeroPez - 1;
      usuario.peces[pezIndex].selected = true;

      // Guardar los cambios en la base de datos
      await usuario.save();

      await interaction.reply(
        `El pez \`${
          usuario.peces[numeroPez - 1].nombre
        }\` ha sido seleccionado.`
      );
    } catch (error) {
      console.error("Error al seleccionar pez:", error);
      await interaction.reply("Hubo un error al intentar seleccionar el pez.");
    }
  },
};
