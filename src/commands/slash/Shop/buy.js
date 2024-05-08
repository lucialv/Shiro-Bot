const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Item = require("../../../schemas/Item");
const Usuario = require("../../../schemas/Usuario");
const GuildSchema = require("../../../schemas/GuildSchema");
const config = require("../../../config");

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
      if (
        config.handler.maintenance &&
        !config.users.developers.includes(interaction.user.id)
      ) {
        return await interaction.reply(config.handler.maintenanceMessage);
      }

      const userId = interaction.user.id;
      const guildId = interaction.guild.id;
      const guild = await GuildSchema.findOne({ guild: guildId });
      if (!guild) {
        return await interaction.reply(
          "Tell your server administrator to run the /setup command to set up the bot"
        );
      }
      const language = guild.language;

      const itemId = interaction.options.getInteger("id") - 1; // Restamos 1 porque la lista de items empieza desde 1 en la interfaz de usuario

      // Buscar el usuario en la base de datos
      const usuario = await Usuario.findOne({ idDiscord: userId });
      if (!usuario) {
        return await interaction.reply(
          language === "en"
            ? "I couldn't find your account. Did you run the /start command?"
            : "No he podido encontrar tu cuenta. ¿Has hecho el comando /start?"
        );
      }

      // Consultar el item seleccionado en la tienda
      const items = await Item.find();
      const itemToBuy = items[itemId];
      if (!itemToBuy) {
        return await interaction.reply(
          language === "en"
            ? "The item you selected doesn't exist."
            : "El item que has seleccionado no existe."
        );
      }

      // Verificar si el usuario tiene suficiente dinero para comprar el item
      if (usuario.dinero < itemToBuy.precio) {
        return await interaction.reply(
          language === "en"
            ? "You don't have enough cookies to buy this item."
            : "No tienes suficientes cookies para comprar este item."
        );
      }

      // Restar el precio del item del dinero del usuario
      usuario.dinero -= itemToBuy.precio;

      // Agregar el item al inventario del usuario
      usuario.inventario.push(itemToBuy);

      // Guardar los cambios en el usuario
      await usuario.save();

      if (
        itemToBuy.idUso === 10 ||
        itemToBuy.idUso === 11 ||
        itemToBuy.idUso === 12
      ) {
        await interaction.reply(
          `${
            language === "en"
              ? "You have successfully bought a"
              : "Acabas de comprar"
          } \`${language === "en" ? itemToBuy.nombre : itemToBuy.nombreES}\` ${
            language === "en" ? "for" : "por"
          } \`${itemToBuy.precio}\` 🍪.\n${
            language === "en"
              ? "You can select it with"
              : "Puedes seleccionarla con"
          } \`/selectrod\``
        );
        return;
      } else {
        await interaction.reply(
          `${
            language === "en"
              ? "You have successfully bought a"
              : "Acabas de comprar"
          } \`${language === "en" ? itemToBuy.nombre : itemToBuy.nombreES}\` ${
            language === "en" ? "for" : "por"
          } \`${itemToBuy.precio}\` 🍪`
        );
      }
    } catch (error) {
      console.error("Error al comprar un item:", error);
      await interaction.reply(
        "An error occurred while buying the item. Pls contact the developer <@300969054649450496> <3"
      );
    }
  },
};
