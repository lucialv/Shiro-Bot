const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Item = require("../../../schemas/Item");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("View all the items available in the shop"),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
      // Consultar todos los items de la tienda desde la base de datos
      const items = await Item.find();

      // Crear un mensaje embed con la lista de items
      const embed = new EmbedBuilder()
        .setTitle("Shop 🍪")
        .setDescription("Here are all the items available in the shop");

      // Array para almacenar los campos de los items
      const fields = [];

      // Iterar sobre cada item y agregar un campo para cada uno
      items.forEach((item, index) => {
        fields.push({
          name: `${item.nombre} ${item.emoji} - \`${index + 1}\``,
          value: `Type: ${item.tipo}\nDescription: ${item.descripcion}\nDurability: ${item.durabilidad}\nPrice: ${item.precio} 🍪`,
        });
      });

      // Agregar todos los campos al embed
      embed.addFields(fields);

      await interaction.reply({ embeds: [embed.toJSON()] });
    } catch (error) {
      console.error("Error al consultar los items de la tienda:", error);
      await interaction.reply(
        "There was an error while trying to view the shop. Pls contact the developer <@300969054649450496> <3"
      );
    }
  },
};
