const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Usuario = require("../../../schemas/Usuario");
const Item = require("../../../schemas/Item");
const GuildSchema = require("../../../schemas/GuildSchema");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("Shows your inventory"),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
      const userId = interaction.user.id;
      const guildId = interaction.guild.id;

      // Buscar al usuario en la base de datos
      const usuario = await Usuario.findOne({ idDiscord: userId });
      if (!usuario) {
        const guild = await GuildSchema.findOne({ guild: guildId });
        const language = guild.language;
        const errorMessage =
          language === "en"
            ? "I couldn't find your account. Did you run the /start command?"
            : "No he podido encontrar tu cuenta. ¿Has hecho el comando /start?";
        return await interaction.reply(errorMessage);
      }

      // Verificar si el usuario tiene algún objeto en su inventario
      if (!usuario.inventario || usuario.inventario.length === 0) {
        const guild = await GuildSchema.findOne({ guild: guildId });
        const language = guild.language;
        const errorMessage =
          language === "en"
            ? "You don't have any items in your inventory."
            : "No tienes ningún objeto en tu inventario.";
        return await interaction.reply(errorMessage);
      }

      // Contar la cantidad de veces que aparece cada objeto en el inventario
      const itemCounts = {};
      usuario.inventario.forEach((item) => {
        if (itemCounts[item.idUso]) {
          itemCounts[item.idUso]++;
        } else {
          itemCounts[item.idUso] = 1;
        }
      });

      // Crear un mensaje embed con el inventario del usuario
      const guild = await GuildSchema.findOne({ guild: guildId });
      const language = guild.language;
      const embed = new EmbedBuilder()
        .setTitle(language === "en" ? "Inventory" : "Inventario")
        .setTimestamp()
        .setFooter({
          text: `${interaction.user.username} ${
            language === "en" ? "inventory" : "inventario"
          } 🎒`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      let description =
        language === "en"
          ? "Here are the items in your inventory:\n\n"
          : "Aquí están los objetos en tu inventario:\n\n";

      for (const itemId in itemCounts) {
        if (itemCounts.hasOwnProperty(itemId)) {
          const itemCount = itemCounts[itemId];
          const item = await Item.findOne({ idUso: itemId });

          if (item) {
            const formattedItem = `${
              language === "en" ? item.nombre : item.nombreES
            } ${item.emoji} (${item.idUso}) - ${itemCount}`;
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
