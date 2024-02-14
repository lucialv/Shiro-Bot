const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Item = require("../../../schemas/Item");
const GuildSchema = require("../../../schemas/GuildSchema");

// Constantes para el control de paginación
const ITEMS_PER_PAGE = 3;

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
      const guildId = interaction.guild.id;
      const guild = await GuildSchema.findOne({ guild: guildId });
      const language = guild.language;

      // Crear un mensaje embed con la lista de items
      const embed = new EmbedBuilder()
        .setTitle(language === "en" ? "Shop 🍪" : "Tienda 🍪")
        .setDescription(
          language === "en"
            ? "Here are all the items available in the shop"
            : "Aquí están todos los items disponibles en la tienda"
        );

      // Obtener el número total de páginas
      const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);

      // Obtener el número de página actual
      let currentPage = 1;

      // Crear un array de campos para la página actual
      const fields = [];

      // Iterar sobre los items de la página actual y agregarlos como campos
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const currentItems = items.slice(startIndex, endIndex);

      currentItems.forEach((item, index) => {
        fields.push({
          name: `${language === "en" ? item.nombre : item.nombreES} ${
            item.emoji
          } - \`${startIndex + index + 1}\``,
          value: `${language === "en" ? "Description" : "Descripcion"}: ${
            language === item.descripcion ? "Type" : item.descripcionES
          }\n${language === "en" ? "Durability" : "Durabilidad"}: ${
            item.durabilidad
          }\n${language === "en" ? "Price" : "Precio"}: ${item.precio} 🍪`,
        });
      });

      // Agregar todos los campos al embed
      embed.addFields(fields);

      // Crear botones para la paginación
      const previousButton = new ButtonBuilder()
        .setCustomId("previous")
        .setLabel(`${language === "en" ? "Previous" : "Anterior"}`)
        .setStyle(1)
        .setDisabled(true); // Deshabilitar el botón de "Previous" en la primera página

      const nextButton = new ButtonBuilder()
        .setCustomId("next")
        .setLabel(`${language === "en" ? "Next" : "Siguiente"}`)
        .setStyle(1);

      // Crear una fila de acciones para los botones
      const actionRow = new ActionRowBuilder()
        .addComponents(previousButton)
        .addComponents(nextButton);

      // Diferir la respuesta antes de enviar el mensaje embed con los botones de paginación
      await interaction.deferReply();

      // Enviar el mensaje embed con los botones de paginación
      await interaction.editReply({
        embeds: [embed.toJSON()],
        components: [actionRow],
      });

      // Manejar las interacciones de botones
      const filter = (interaction) => {
        return interaction.user.id === interaction.user.id;
      };

      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 60000, // Tiempo de espera para la interacción
      });

      collector.on("collect", async (buttonInteraction) => {
        // Manejar la interacción del botón
        if (buttonInteraction.customId === "next") {
          // Avanzar a la siguiente página
          currentPage++;
          if (currentPage >= totalPages) {
            nextButton.setDisabled(true);
            previousButton.setDisabled(false);
          }
        } else if (buttonInteraction.customId === "previous") {
          // Retroceder a la página anterior
          nextButton.setDisabled(false);
          if (currentPage > 1) {
            currentPage--;
            if (currentPage === 1) {
              previousButton.setDisabled(true);
            }
          }
        }

        // Actualizar el mensaje con la nueva página
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const currentItems = items.slice(startIndex, endIndex);

        const updatedFields = [];
        currentItems.forEach((item, index) => {
          updatedFields.push({
            name: `${language === "en" ? item.nombre : item.nombreES} ${
              item.emoji
            } - \`${startIndex + index + 1}\``,
            value: `${language === "en" ? "Description" : "Descripcion"}: ${
              language === item.descripcion ? "Type" : item.descripcionES
            }\n${language === "en" ? "Durability" : "Durabilidad"}: ${
              item.durabilidad
            }\n${language === "en" ? "Price" : "Precio"}: ${item.precio} 🍪`,
          });
        });

        // Actualizar el mensaje embed con los nuevos campos
        if (embed.fields && embed.fields.length > 0) {
          embed.spliceFields(0, embed.fields.length);
        }
        // Limpiar los fields que tiene el embed
        embed.data.fields = [];

        embed.addFields(updatedFields);

        await buttonInteraction.update({
          embeds: [embed.toJSON()],
          components: [actionRow],
        });
      });

      collector.on("end", async () => {
        // Limpiar los botones cuando la colección termina (después de 60 segundos en este caso)
        await interaction.editReply({ components: [] });
      });
    } catch (error) {
      console.error("Error al consultar los items de la tienda:", error);
      await interaction.reply(
        "There was an error while trying to view the shop. Pls contact the developer <@300969054649450496> <3"
      );
    }
  },
};
