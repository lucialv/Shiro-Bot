const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Usuario = require("../../../schemas/Usuario");
const Item = require("../../../schemas/Item");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("Shows the items in your inventory"),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
      const userId = interaction.user.id;

      // Buscar el usuario en la base de datos
      const usuario = await Usuario.findOne({ idDiscord: userId });
      if (!usuario) {
        return await interaction.reply(
          "I couldn't find your account. Did you run the /start command?"
        );
      }

      // Verificar si el usuario tiene algún item en su inventario
      if (!usuario.inventario || usuario.inventario.length === 0) {
        return await interaction.reply(
          "You don't have any items in your inventory."
        );
      }

      // Contar la cantidad de veces que aparece cada item en el inventario
      const itemCounts = {};
      usuario.inventario.forEach((item) => {
        if (itemCounts[item.idUso]) {
          itemCounts[item.idUso]++;
        } else {
          itemCounts[item.idUso] = 1;
        }
      });

      // Crear un mensaje embed con el inventario del usuario
      const embed = new EmbedBuilder()
        .setTitle("Inventory")
        .setDescription("Here are the items in your inventory")
        .setTimestamp()
        .setFooter({
          text: `${interaction.user.username} inventory`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      let description = "";

      for (const itemId in itemCounts) {
        if (itemCounts.hasOwnProperty(itemId)) {
          const itemCount = itemCounts[itemId];
          const item = await Item.findOne({ idUso: itemId });

          if (item) {
            const formattedItem = `${item.nombre} ${item.emoji} (${item.idUso}) - ${itemCount}`;
            description += `${formattedItem}\n`;
          }
        }
      }

      embed.setDescription(description);

      await interaction.reply({ embeds: [embed.toJSON()] });
    } catch (error) {
      console.error("Error al ver el inventario:", error);
      await interaction.reply(
        "There was an error while trying to view your inventory. Please contact the developer <@300969054649450496> <3"
      );
    }
  },
};
