const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js");
const GuildSchema = require("../../../schemas/GuildSchema");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Configures fishing channels.")
    .addChannelOption((option) =>
      option
        .setName("channel1")
        .setDescription("First fishing channel")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel2")
        .setDescription("Second fishing channel")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel3")
        .setDescription("Third fishing channel")
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
      const guildId = interaction.guild.id;
      const guild = await GuildSchema.findOne({ guild: guildId });

      const channel1Id = interaction.options.getChannel("channel1").id;
      const channel2Id = interaction.options.getChannel("channel2").id;
      const channel3Id = interaction.options.getChannel("channel3").id;
      const language = interaction.options.getString("language");

      // Guardar los canales de pesca en la base de datos
      await GuildSchema.findOneAndUpdate(
        { guild: guildId },
        {
          canal_pesca_1: channel1Id,
          canal_pesca_2: channel2Id,
          canal_pesca_3: channel3Id,
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
