const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const os = require("os");
const discordVersion = require("discord.js").version;

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Muestra información sobre el bot"),
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

      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Información del Bot")
        .setDescription("Aquí tienes algunos detalles sobre el bot:")
        .addFields(
          {
            name: "Uso de Memoria",
            value: `${(usedMemory / 1024 / 1024).toFixed(2)} MB / ${(
              totalMemory /
              1024 /
              1024
            ).toFixed(2)} MB`,
            inline: true,
          },
          {
            name: "Uso de CPU",
            value: `${cpuUsage.toFixed(2)}%`,
            inline: true,
          },
          { name: "Versión de Discord.js", value: discordVersion },
          { name: "Versión de Node.js", value: process.version },
          { name: "Desarrolladora", value: "<@300969054649450496>" }
        );

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error al obtener información del bot:", error);
      await interaction.reply(
        "Hubo un error al intentar obtener información del bot."
      );
    }
  },
};
