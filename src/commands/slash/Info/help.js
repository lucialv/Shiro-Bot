const fs = require("fs");
const path = require("path");
const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const colorsEmbed = require("../../../utility/colorsEmbed");
const config = require("../../../config");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("help")
    .setDescription("View all the possible commands!"),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    if (
      config.handler.maintenance &&
      !config.users.developers.includes(interaction.user.id)
    ) {
      return await interaction.reply(config.handler.maintenanceMessage);
    }
    await interaction.deferReply();

    const commandsPath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "commands",
      "slash"
    );
    const categories = fs.readdirSync(commandsPath);

    const embed = new EmbedBuilder()
      .setTitle("Help")
      .setColor(colorsEmbed["blue"])
      .setDescription("View all the possible commands by category:");

    for (const category of categories) {
      // Exclude "Developers" category
      if (category.toLowerCase() === "developers") continue;

      const categoryPath = path.join(commandsPath, category);
      const categoryCommands = fs
        .readdirSync(categoryPath)
        .filter((file) => file.endsWith(".js"))
        .map((file) => require(path.join(categoryPath, file)));

      const commandsList = categoryCommands
        .map(
          (cmd) =>
            `\`${cmd.structure.name}\`: ${
              cmd.structure.description || "(No description)"
            }`
        )
        .join("\n");

      embed.addFields({ name: category, value: commandsList });
    }

    await interaction.followUp({ embeds: [embed.toJSON()] });
  },
};
