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
    .setDescription("Buy an item from the shop")
    .addIntegerOption((option) =>
      option
        .setName("id")
        .setDescription("ID of the item in the shop")
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
        return await interaction.reply(
          "I couldn't find your account. Did you run the /start command?"
        );
      }

      // Consultar el item seleccionado en la tienda
      const items = await Item.find();
      const itemToBuy = items[itemId];
      if (!itemToBuy) {
        return await interaction.reply("The item you selected doesn't exist.");
      }

      // Verificar si el usuario tiene suficiente dinero para comprar el item
      if (usuario.dinero < itemToBuy.precio) {
        return await interaction.reply(
          "You don't have enough 🍪 to buy this item."
        );
      }

      // Restar el precio del item del dinero del usuario
      usuario.dinero -= itemToBuy.precio;

      // Agregar el item al inventario del usuario
      usuario.inventario.push(itemToBuy);

      // Guardar los cambios en el usuario
      await usuario.save();

      await interaction.reply(
        `You have successfully bought a ${itemToBuy.nombre} for ${itemToBuy.precio} 🍪`
      );
    } catch (error) {
      console.error("Error al comprar un item:", error);
      await interaction.reply(
        "An error occurred while buying the item. Pls contact the developer <@300969054649450496> <3"
      );
    }
  },
};
