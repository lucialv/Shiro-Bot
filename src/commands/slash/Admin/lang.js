const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const GuildSchema = require("../../../schemas/GuildSchema");
const config = require("../../../config");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("lang")
    .setDescription("Set the language of the bot")
    .addStringOption((option) =>
      option
        .setName("language")
        .setDescription("Select the language")
        .setRequired(true)
        .addChoices(
          {
            name: "English",
            value: "en",
          },
          {
            name: "Español",
            value: "es",
          }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
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
      // Obtener el idioma seleccionado por el usuario
      const language = interaction.options.getString("language");

      // Actualizar el idioma en el esquema de la guild
      const guildId = interaction.guild.id;
      await GuildSchema.findOneAndUpdate({ guild: guildId }, { language });

      // Enviar mensaje de confirmación
      await interaction.reply(
        `${
          language === "en"
            ? "Language set to `English`"
            : "Idioma cambiado a `Español`"
        }`
      );
    } catch (error) {
      console.error("Error al cambiar el idioma:", error);
      await interaction.reply(
        "There was an error while trying to set the language."
      );
    }
  },
};
