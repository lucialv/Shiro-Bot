const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const discordVersion = require("discord.js").version;
const Usuario = require("../../../schemas/Usuario");

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
      //get the number of guilds the bot is in
      const guilds = client.guilds.cache.size;
      //get the number of players in DB
      const players = await Usuario.countDocuments();

      console.log(guilds, players);
      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Bot information")
        .setDescription(
          "Here's some information about the bot <:Blobhaj:1207351064777465938>"
        )
        .setTimestamp()
        .setFooter({
          text: `${client.user.username} info`,
          iconURL: client.user.displayAvatarURL(),
        })
        .addFields(
          {
            name: "Guilds",
            value: `${guilds}`,
            inline: true,
          },
          {
            name: "Players",
            value: `${players}`,
            inline: true,
          },
          { name: "Discord.js Version", value: discordVersion },
          { name: "Node.js Version", value: process.version },
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
