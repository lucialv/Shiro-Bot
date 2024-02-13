const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const os = require("os");
const discordVersion = require("discord.js").version;
const os = require("os");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Shows information about the bot"),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
      const memoryUsage = process.memoryUsage();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const cpuUsage = process.cpuUsage().user / 1000000; // En milisegundos
      const networkInterfaces = os.networkInterfaces();
      const ipAddress = networkInterfaces["eth0"][0].address;

      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Bot information")
        .setDescription("Here's some information about the bot")
        .addFields(
          {
            name: "Memmory usage",
            value: `${(usedMemory / 1024 / 1024).toFixed(2)} MB / ${(
              totalMemory /
              1024 /
              1024
            ).toFixed(2)} MB`,
            inline: true,
          },
          {
            name: "CPU usage",
            value: `${cpuUsage.toFixed(2)}%`,
            inline: true,
          },
          {
            name: "Ip of the server",
            value: ipAddress,
          },
          { name: "Version of Discord.JS", value: discordVersion },
          { name: "Version of Node.js", value: process.version },
          { name: "Developer", value: "<@300969054649450496>" }
        );

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error al obtener información del bot:", error);
      await interaction.reply(
        "There was an error while trying to view the bot's information. Pls contact the developer <@300969054649450496> <3"
      );
    }
  },
};
