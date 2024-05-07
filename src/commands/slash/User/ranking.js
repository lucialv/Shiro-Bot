const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Item = require("../../../schemas/Item");
const Usuario = require("../../../schemas/Usuario");
const GuildSchema = require("../../../schemas/GuildSchema");
const config = require("../../../config");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("ranking")
    .setDescription("Shows the ranking of the users"),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
      if (
        config.handler.maintenance &&
        interaction.user.id != config.users.developers
      ) {
        return await interaction.reply(config.handler.maintenanceMessage);
      }
      const guildId = interaction.guild.id;
      const guild = await GuildSchema.findOne({ guild: guildId });
      if (!guild) {
        return await interaction.reply(
          "Tell your server administrator to run the /setup command to set up the bot"
        );
      }
      const language = guild.language;
      const usuarios = await Usuario.find({}).sort({ dinero: -1 }).limit(10);

      const embed = new EmbedBuilder()
        .setTitle(language === "en" ? "Ranking" : "Clasificación")
        .setFooter({
          text: `${language === "en" ? "ranking 🍪" : "clasificación 🍪"}`,
          iconURL: client.user.displayAvatarURL(),
        })
        .setTimestamp()
        .setDescription(
          language === "en"
            ? "Top 10 Users with the Most Cookies:"
            : "Top 10 Usuarios con más Galletas:"
        );

      const fields = [];
      usuarios.forEach((usuario, index) => {
        fields.push({
          name: `${
            index + 1 === 1
              ? "<:number_one:1208713417708273674> "
              : index + 1 + "."
          } ${usuario.nombre}`,
          value: `- \`${usuario.dinero}\` 🍪`,
        });
      });

      embed.addFields(fields);

      await interaction.reply({ embeds: [embed.toJSON()] });
    } catch (error) {
      console.error("Error al ver el ranking:", error);
      await interaction.reply(
        "An error occurred while trying to view the ranking. Pls contact the developer <@300969054649450496> <3"
      );
    }
  },
};
