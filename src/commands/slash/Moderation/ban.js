const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Usuario = require("../../../schemas/Usuario");
const GuildSchema = require("../../../schemas/GuildSchema");
const colorsEmbed = require("../../../utility/colorsEmbed");
const config = require("../../../config");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user from the server")
    .addUserOption((option) =>
      option.setName("user").setDescription("User to ban").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for the ban")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  options: {
    developers: true,
  },
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
      const userId = interaction.user.id;
      const guildId = interaction.guild.id;
      const guild = await GuildSchema.findOne({ guild: guildId });
      if (!guild) {
        return await interaction.reply(
          "Tell your server administrator to run the /setup command to set up the bot"
        );
      }
      const language = guild.language;
      const userToBan = interaction.options.getMember("user");
      // Buscar al usuario en la base de datos
      const usuario = await Usuario.findOne({ idDiscord: userId });
      if (!usuario) {
        if (language === "en") {
          return await interaction.reply(
            "I couldn't find your account. Did you run the /start command?"
          );
        } else {
          return await interaction.reply(
            "No he podido encontrar tu cuenta. ¿Has hecho el comando /start?"
          );
        }
      }

      if (!userToBan) {
        if (language === "en") {
          return await interaction.reply("I couldn't find the user.");
        } else {
          return await interaction.reply("No pude encontrar al usuario.");
        }
      }

      if (userToBan.id === interaction.user.id) {
        if (language === "en") {
          return await interaction.reply(
            "You cannot ban yourself from the server."
          );
        } else {
          return await interaction.reply(
            "No puedes banearte a ti mismo del servidor."
          );
        }
      }

      if (!userToBan.bannable) {
        if (language === "en") {
          return await interaction.reply(
            "I cannot ban this user. Please check my permissions."
          );
        } else {
          return await interaction.reply(
            "No puedo banear a este usuario. Por favor, revisa mis permisos."
          );
        }
      }

      const reason = interaction.options.getString("reason");

      await interaction.guild.members.ban(userToBan.id, { reason });

      // Enviar mensaje al usuario baneado
      await userToBan
        .send({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `You were banned from the server **${interaction.guild.name}**\n- Reason: ${reason}\n- Banned by: <@${interaction.user.id}>`
              )
              .setColor(colorsEmbed["red"])
              .setTimestamp()
              .setFooter({
                text: `${interaction.user.username} banned you`,
                iconURL: interaction.user.displayAvatarURL(),
              })
              .toJSON(),
          ],
        })
        .catch(async () => {
          await interaction.reply(
            "I couldn't send a message to the user who was banned."
          );
        });
      if (language === "en") {
        const embed = new EmbedBuilder()
          .setDescription(
            `### <@${userToBan.id}> was banned <a:check:1206885683474599936>\n- Reason: ${reason}\n- Banned by: <@${interaction.user.id}>`
          )
          .setColor(colorsEmbed["blue"])
          .setTimestamp()
          .setFooter({
            text: `${interaction.user.username} banned ${userToBan.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          });
        await interaction.reply({ embeds: [embed.toJSON()] });
      } else {
        const embed = new EmbedBuilder()
          .setDescription(
            `### <@${userToBan.id}> fue baneado <a:check:1206885683474599936>\n- Razón: ${reason}\n- Baneado por: <@${interaction.user.id}>`
          )
          .setColor(colorsEmbed["blue"])
          .setTimestamp()
          .setFooter({
            text: `${interaction.user.username} baneó a ${userToBan.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          });
        await interaction.reply({ embeds: [embed.toJSON()] });
      }
    } catch (error) {
      console.error("Error al banear:", error);
      await interaction.reply(
        "There was an error while trying to ban. Pls contact the developer <@300969054649450496> <3"
      );
    }
  },
};
