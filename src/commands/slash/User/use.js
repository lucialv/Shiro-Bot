const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Usuario = require("../../../schemas/Usuario");
const GuildSchema = require("../../../schemas/GuildSchema");
const config = require("../../../config");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("use")
    .setDescription("Use an item from your inventory")
    .addIntegerOption((option) =>
      option
        .setName("iduso")
        .setDescription("ID to use the item")
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
        interaction.user.id != config.users.developers
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

      const itemIdUso = interaction.options.getInteger("iduso"); // Restamos 1 porque la lista de items empieza desde 1 en la interfaz de usuario

      // Buscar el usuario en la base de datos
      const usuario = await Usuario.findOne({ idDiscord: userId });
      if (!usuario) {
        return await interaction.reply(
          language === "en"
            ? "I couldn't find your account. Did you run the /start command?"
            : "No he podido encontrar tu cuenta. ¿Has hecho el comando /start?"
        );
      }

      const itemIndex = usuario.inventario
        .map((item, index) => {
          return {
            index,
            item,
          };
        })
        .filter((item) => item.item.idUso === itemIdUso)
        .sort((a, b) => a.item.durabilidad - b.item.durabilidad)
        .map((item) => item.index)[0];

      const itemToUse = usuario.inventario[itemIndex];

      if (!itemToUse) {
        return await interaction.reply(
          language === "en"
            ? "The item you selected doesn't exist."
            : "El item que has seleccionado no existe."
        );
      }

      // Verificar si el item se puede usar
      if (!itemToUse.usable) {
        return await interaction.reply(
          language === "en"
            ? "You can't use this item."
            : "No puedes usar este item."
        );
      }

      if (itemIdUso === 1000) {
        //Si lo usa restarle 1 de durabilidad, si llega a 0 eliminarlo del inventario
        itemToUse.durabilidad = itemToUse.durabilidad - 1;
        if (itemToUse.durabilidad === 0) {
          usuario.inventario.splice(itemIndex, 1);
        }
        usuario.dinero += 100;
        // Guardar los cambios en el usuario
        await usuario.save();
        return await interaction.reply(
          language === "en"
            ? `You have successfully used ${itemToUse.nombre} and you have earned 100 🍪`
            : `Has usado ${itemToUse.nombreES} con éxito y has ganado 100 🍪`
        );
      }

      await interaction.reply(
        language === "en"
          ? "I dont have coded the use of that item, sorry!"
          : "No tengo programado el uso de ese item, lo siento!"
      );
    } catch (error) {
      console.error("Error al comprar un item:", error);
      await interaction.reply(
        "An error occurred while buying the item. Pls contact the developer <@300969054649450496> <3"
      );
    }
  },
};
