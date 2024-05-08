const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js");
const GuildSchema = require("../../../schemas/GuildSchema");
const config = require("../../../config");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Configures fishing channels.")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Select the fishing channel")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("language")
        .setDescription("Language of the bot")
        .addChoices(
          { name: "English", value: "en" },
          { name: "Spanish", value: "es" }
        )
        .setRequired(true)
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
      const guildId = interaction.guild.id;
      const guild = await GuildSchema.findOne({ guild: guildId });

      const channelId = interaction.options.getChannel("channel").id;
      const language = interaction.options.getString("language");

      // Guardar los canales de pesca en la base de datos
      await GuildSchema.findOneAndUpdate(
        { guild: guildId },
        {
          canal_pesca_1: channelId,
          language: language,
        },
        { upsert: true }
      );

      await interaction.reply(
        language === "en"
          ? "Fishing channels configured successfully."
          : "Canales de pesca configurados correctamente."
      );
    } catch (error) {
      console.error("Error configuring fishing channels:", error);
      await interaction.reply(
        "There was an error while configuring fishing channels."
      );
    }
  },
};
