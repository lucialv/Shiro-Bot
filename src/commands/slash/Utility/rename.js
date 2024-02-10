const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const Usuario = require("../../../schemas/Usuario");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("rename")
    .setDescription("Renombra un pez de tu inventario")
    .addIntegerOption((option) =>
      option
        .setName("numero_pez")
        .setDescription("Número del pez en tu inventario a renombrar")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("nuevo_nombre")
        .setDescription("Nuevo nombre del pez")
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
      const nuevoNombre = interaction.options.getString("nuevo_nombre");

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
      usuario.peces[pezIndex].nombre = nuevoNombre;

      // Guardar los cambios en la base de datos
      await usuario.save();

      await interaction.reply(
        `El pez número \`${numeroPez}\` ha sido renombrado a \`${nuevoNombre}\`.`
      );
    } catch (error) {
      console.error("Error al renombrar al pez.", error);
      await interaction.reply("Hubo un error al intentar renombrar al pez.");
    }
  },
};
