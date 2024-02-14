const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const config = require("../../../config");
const GuildSchema = require("../../../schemas/GuildSchema");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("help")
    .setDescription("View all the possible commands!"),
  options: {
    cooldown: 15000,
  },
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    await interaction.deferReply();

    const guildId = interaction.guild.id;
    const guild = await GuildSchema.findOne({ guild: guildId });
    const language = guild.language;

    const mapIntCmds = client.applicationcommandsArray.map(
      (v) =>
        `\`${v.type === 2 || v.type === 3 ? "" : "/"}${v.name}\`: ${
          v.description || "(No description)"
        }`
    );

    await interaction.followUp({
      embeds: [
        new EmbedBuilder()
          .setTitle(language === "en" ? "Help" : "Menú de ayuda")
          .addFields({
            name: `${language === "en" ? "Commands" : "Comandos"}`,
            value: `${mapIntCmds.join("\n")}`,
          }),
      ],
    });
  },
};
