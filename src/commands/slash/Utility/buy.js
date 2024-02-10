const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Item = require("../../../schemas/Item");
const Usuario = require("../../../schemas/Usuario");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("buy")
    .setDescription("Permite al usuario comprar un item de la tienda")
    .addIntegerOption((option) =>
      option
        .setName("id")
        .setDescription("ID del item que quieres comprar")
        .setRequired(true)
    ),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
      const userId = interaction.user.id;
      const itemId = interaction.options.getInteger("id") - 1; // Restamos 1 porque la lista de items empieza desde 1 en la interfaz de usuario

      // Buscar el usuario en la base de datos
      const usuario = await Usuario.findOne({ idDiscord: userId });
      if (!usuario) {
        return await interaction.reply("No se pudo encontrar al usuario.");
      }

      // Consultar el item seleccionado en la tienda
      const items = await Item.find();
      const itemToBuy = items[itemId];
      if (!itemToBuy) {
        return await interaction.reply("El item seleccionado no existe.");
      }

      // Verificar si el usuario tiene suficiente dinero para comprar el item
      if (usuario.dinero < itemToBuy.precio) {
        return await interaction.reply(
          "No tienes suficiente dinero para comprar este item."
        );
      }

      // Restar el precio del item del dinero del usuario
      usuario.dinero -= itemToBuy.precio;

      // Agregar el item al inventario del usuario
      usuario.inventario.push(itemToBuy);

      // Guardar los cambios en el usuario
      await usuario.save();

      await interaction.reply(
        `¡Has comprado "${itemToBuy.nombre}" por ${itemToBuy.precio} monedas!`
      );
    } catch (error) {
      console.error("Error al comprar un item:", error);
      await interaction.reply("Hubo un error al intentar comprar el item.");
    }
  },
};
