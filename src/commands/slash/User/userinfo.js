const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const { profileImage } = require("discord-arts");
const Usuario = require("../../../schemas/Usuario");
const GuildSchema = require("../../../schemas/GuildSchema");
const colorsEmbed = require("../../../utility/colorsEmbed");
const config = require("../../../config");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Get a user's information.")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("The user.").setRequired(false)
    ),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    if (config.handler.maintenance) {
      return await interaction.reply(config.handler.maintenanceMessage);
    }
    const member = interaction.options.getMember("user") || interaction.member;
    const guildId = interaction.guild.id;
    const guild = await GuildSchema.findOne({ guild: guildId });
    if (!guild) {
      return await interaction.reply(
        "Tell your server administrator to run the /setup command to set up the bot"
      );
    }
    const language = guild.language;

    if (member.user.bot) {
      const errorMessage =
        language === "en"
          ? "You can't get information about a bot. <a:6764_no:1097556585192112149>"
          : "No puedes obtener información sobre un bot. <a:6764_no:1097556585192112149>";
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(errorMessage)
            .setColor(colorsEmbed["blue"]),
        ],
        ephemeral: true,
      });
    }

    await interaction.deferReply();
    const userId = member.id;

    // Buscar al usuario en la base de datos
    const usuario = await Usuario.findOne({ idDiscord: userId });
    if (!usuario) {
      const errorMessage =
        language === "en"
          ? `I couldn't find the account of <@${userId}>. Did they run the /start command?`
          : `No pude encontrar la cuenta de <@${userId}>. ¿Ejecutaron el comando /start?`;
      return await interaction.reply(errorMessage);
    }

    let badges = "";

    if (usuario.badges.length !== 0) {
      usuario.badges.forEach((badge) => {
        if (badge === "developer") {
          badges +=
            "<:dev1:1207365411893551104><:dev2:1207365413462212628><:dev3:1207365415127490570> ";
        }
        if (badge === "beta") {
          badges +=
            "<:beta1:1207368081979088948><:beta2:1207368088895627364><:beta3:1207368089990336553> ";
        }
      });
    } else {
      badges = "<a:6764_no:1097556585192112149>";
    }
    if (usuario.donator) {
      badges +=
        "<:donator1:1208688704651005963><:donator2:1208688706312208414><:donator3:1208688707528556544><:donator4:1208688709055283210>";
    }
    // Eliminar el último espacio en blanco, si existe
    badges = badges.trim();

    const fecha = new Date(usuario.startedOn);
    const fechaUnix = fecha.getTime() / 1000;
    //quitar los decimales de fechaUnix
    const joinTime = Math.floor(fechaUnix);

    try {
      const profileBuffer = await profileImage(member.id);
      const imageAttachment = new AttachmentBuilder(profileBuffer, {
        name: `profile.png`,
      });

      const Donator = usuario.donator
        ? "<a:check:1206885683474599936>"
        : "<a:6764_no:1097556585192112149>";

      const Embed = new EmbedBuilder()
        .setAuthor({
          name: `${member.user.username} | ${
            language === "en" ? "User Info" : "Información de Usuario"
          }`,
          iconURL: member.displayAvatarURL(),
        })
        .setColor(colorsEmbed["blue"])
        .setDescription(
          language === "en"
            ? `In <t:${joinTime}:D>, <@${userId}> started fishing!`
            : `¡En <t:${joinTime}:D>, <@${userId}> empezó a pescar!`
        )
        .setImage("attachment://profile.png")
        .addFields([
          {
            name: language === "en" ? "Badges" : "Insignias",
            value: `${badges}`,
            inline: true,
          },
          {
            name: language === "en" ? "Donator" : "Donador",
            value: `${Donator}`,
            inline: true,
          },
          {
            name: language === "en" ? "Items" : "Objetos",
            value: `${usuario.inventario.length}`,
            inline: true,
          },
          {
            name: language === "en" ? "Cookies" : "Galletas",
            value: `${usuario.dinero} 🍪`,
            inline: true,
          },
          {
            name: language === "en" ? "Fishes Fished" : "Peces Pescados",
            value: `${usuario.capturados}`,
            inline: true,
          },
          {
            name: language === "en" ? "Total Fishes" : "Total de Peces",
            value: `${usuario.peces.length}`,
            inline: true,
          },
        ]);

      interaction.editReply({
        embeds: [Embed],
        files: [imageAttachment],
      });
    } catch (error) {
      interaction.editReply({
        content:
          language === "en"
            ? "An Error Has Ocurred: Contact with <@300969054649450496>"
            : "Ha ocurrido un error: Contacta con <@300969054649450496>",
      });
      throw error;
    }
  },
};
