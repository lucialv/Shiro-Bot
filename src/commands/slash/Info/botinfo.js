const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const discordVersion = require("discord.js").version;
const Usuario = require("../../../schemas/Usuario");
const GuildSchema = require("../../../schemas/GuildSchema");
const colorsEmbed = require("../../../utility/colorsEmbed");

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

      //get the number of people of the guild the bot is in
      var usersCount = 0;
      client.guilds.cache.mapValues((guild) => {
        const _x = client.guilds.cache.get(guild.id);
        usersCount += client.guilds.cache.reduce(
          (a, g) => a + g.memberCount,
          0
        );
      });
      console.log(usersCount);

      const guildId = interaction.guild.id;
      const guild = await GuildSchema.findOne({ guild: guildId });
      if (!guild) {
        return await interaction.reply(
          "Tell your server administrator to run the /setup command to set up the bot"
        );
      }
      const language = guild.language;
      //get the number of players in DB
      const players = await Usuario.countDocuments();

      const embed = new EmbedBuilder()
        .setColor(colorsEmbed["blue"])
        .setTitle(language === "en" ? "Bot Information" : "Información del bot")
        .setDescription(
          language === "en"
            ? "Here you can see some information about the bot <:Blobhaj:1207351064777465938>"
            : "Aquí puedes ver información sobre el bot <:Blobhaj:1207351064777465938>"
        )
        .setTimestamp()
        .setFooter({
          text: `${client.user.username} info`,
          iconURL: client.user.displayAvatarURL(),
        })
        .addFields(
          {
            name: language === "en" ? "Guilds" : "Servidores",
            value: `${guilds}`,
            inline: true,
          },
          {
            name: language === "en" ? "Total Users" : "Usuarios totales",
            value: `${usersCount}`,
            inline: true,
          },
          {
            name: language === "en" ? "Players" : "Jugadores",
            value: `${players}`,
            inline: true,
          },
          {
            name:
              language === "en"
                ? "Discord.js Version"
                : "Versión de Discord.js",
            value: discordVersion,
          },
          {
            name: language === "en" ? "Node.js Version" : "Versión de Node.js",
            value: process.version,
          },
          {
            name: language === "en" ? "Developer" : "Programadora",
            value: "<@300969054649450496>",
          }
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
