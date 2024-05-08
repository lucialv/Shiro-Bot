const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
} = require("discord.js");
const Usuario = require("../../../schemas/Usuario");
const GuildSchema = require("../../../schemas/GuildSchema");
const colorsEmbed = require("../../../utility/colorsEmbed");
const config = require("../../../config");

// Definir emojis para cada rareza
const rarezaEmojis = {
  Common:
    "<:common1:1205868965226618980><:common2:1205868966648479824><:common3:1205868967889993759><:common4:1205868968850624634>",
  Rare: "<:rare1:1205877104768716830><:rare2:1205877105875886160><:rare3:1205877106983043113>",
  "Very rare":
    "<:very_rare1:1205877417235709953><:very_rare2:1205877418871623712><:very_rare3:1205877420062675015><:very_rare4:1205877420889215048>",
  Epic: "<:epic1:1205877519958544395><:epic2:1205877521241874492><:epic3:1205877522609213460>",
  Legendary:
    "<:legendary1:1205880191079940107><:legendary2:1205880192451485766><:legendary3:1205880193340801085><:legendary4:1205880194993233940><:legendary5:1205880196180484117><:legendary6:1205880197090639883><:legendary7:1205880198680285186>",
  Mitic:
    "<:mitic1:1205881199545811046><:mitic2:1205881200695316480><:mitic3:1205881201970126868><:mitic4:1205881207653670973><:mitic5:1205881208878145566>",
};

const generoEmojis = {
  Boy: "<:male:1205911279714435143>",
  Girl: "<:female:1205911278791430204>",
};

// Constantes para el control de paginación
const FISHES_PER_PAGE = 10;

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("fishes")
    .setDescription("Shows the fishes in your inventory"),
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
      // Buscar al usuario en la base de datos
      const usuario = await Usuario.findOne({ idDiscord: userId });

      if (!usuario || usuario.peces.length === 0) {
        return await interaction.reply(
          language === "en"
            ? "You don't have any fish in your inventory."
            : "No tienes ningún pez en tu inventario."
        );
      }

      const peces = usuario.peces;
      const totalPages = Math.ceil(peces.length / FISHES_PER_PAGE);

      // Obtener el número de página actual
      let currentPage = 1;

      // Iterar sobre los items de la página actual y agregarlos como campos
      const startIndex = (currentPage - 1) * FISHES_PER_PAGE;
      const endIndex = startIndex + FISHES_PER_PAGE;
      const currentItems = peces.slice(startIndex, endIndex);

      const embed = new EmbedBuilder()
        .setTitle(`${language === "en" ? "Inventory" : "Inventario"} 🎣`)
        .setDescription(
          `${
            language === "en"
              ? "You have the following fishes in your inventory"
              : "Tienes los siguientes peces en tu inventario"
          }:`
        )
        .setColor(colorsEmbed["blue"])
        .setTimestamp()
        .setFooter({
          text: `${interaction.user.username} ${
            language === "en" ? "fishes" : "peces"
          } 🐟`,
          iconURL: interaction.user.displayAvatarURL(),
        });
      // Crear un mensaje con la lista de peces del usuario
      let description = `${
        language === "en"
          ? "You have the following fishes in your inventory"
          : "Tienes los siguientes peces en tu inventario"
      }:\n`;

      currentItems.forEach((pez, index) => {
        // Obtener el emoji correspondiente a la rareza del pez
        const rarezaEmoji = rarezaEmojis[pez.rareza] || "";
        const generoEmoji = generoEmojis[pez.genero] || "";

        // Agregar la cadena de texto si el pez está marcado como favorito
        const favoritoText = pez.favourite
          ? " <:heartyy:1205896133277253694>"
          : "";
        const selectedText = pez.selected
          ? "<:selected:1207617274584891392>"
          : "";

        // Agregar el pez al mensaje con su rareza, emoji y cadena de texto de favorito
        description += `- ID: \`${index + 1}\` | ${
          pez.nombre
        } ${generoEmoji} ${rarezaEmoji} ${
          language === "en" ? "Level" : "Nivel"
        } ${pez.nivel} ${favoritoText} ${selectedText}\n`;
      });
      embed.setDescription(description);

      if (peces.length <= FISHES_PER_PAGE) {
        return await interaction.reply({
          embeds: [embed.toJSON()],
        });
      }

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
        const startIndex = (currentPage - 1) * FISHES_PER_PAGE;
        const endIndex = startIndex + FISHES_PER_PAGE;
        const currentItems = peces.slice(startIndex, endIndex);
        const multiplicadorDePagina = (currentPage - 1) * FISHES_PER_PAGE;
        let description2 = `${
          language === "en"
            ? "You have the following fishes in your inventory"
            : "Tienes los siguientes peces en tu inventario"
        }:\n`;
        description = "";
        currentItems.forEach((pez, index) => {
          // Obtener el emoji correspondiente a la rareza del pez
          const rarezaEmoji = rarezaEmojis[pez.rareza] || "";
          const generoEmoji = generoEmojis[pez.genero] || "";

          // Agregar la cadena de texto si el pez está marcado como favorito
          const favoritoText = pez.favourite
            ? " <:heartyy:1205896133277253694>"
            : "";

          // Agregar el pez al mensaje con su rareza, emoji y emoji de fav
          description2 += `- ID: \`${index + 1 + multiplicadorDePagina}\` | ${
            pez.nombre
          } ${generoEmoji} ${rarezaEmoji} ${
            language === "en" ? "Level" : "Nivel"
          } ${pez.nivel} ${favoritoText}\n`;
        });
        embed.setDescription(description2);

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
      console.error("Error al consultar los peces del usuario:", error);
      await interaction.reply(
        "There was an error while trying to view your fishes. Pls contact the developer <@300969054649450496> <3"
      );
    }
  },
};
