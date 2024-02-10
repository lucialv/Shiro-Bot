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
    .setDescription("Muestra todos los items disponibles en la tienda"),
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
        .setTitle("Tienda")
        .setDescription("Aquí están todos los items disponibles en la tienda:");

      // Array para almacenar los campos de los items
      const fields = [];

      // Iterar sobre cada item y agregar un campo para cada uno
      items.forEach((item, index) => {
        fields.push({
          name: `${item.nombre} ${item.emoji} - \`${index + 1}\``,
          value: `Tipo: ${item.tipo}\nDescripción: ${item.descripcion}\nDurabilidad: ${item.durabilidad}\nPrecio: ${item.precio}`,
        });
      });

      // Agregar todos los campos al embed
      embed.addFields(fields);

      await interaction.reply({ embeds: [embed.toJSON()] });
    } catch (error) {
      console.error("Error al consultar los items de la tienda:", error);
      await interaction.reply(
        "Hubo un error al intentar consultar los items de la tienda."
      );
    }
  },
};
