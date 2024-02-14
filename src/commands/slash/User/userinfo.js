const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const { time } = require("../../../functions");
const { profileImage } = require("discord-arts");

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
    await interaction.deferReply();
    const member = interaction.options.getMember("user") || interaction.member;
    function addSuffix(number) {
      if (number % 100 >= 11 && number % 100 <= 13) return number + "th";
      switch (number % 10) {
        case 1:
          return number + "st";
        case 2:
          return number + "nd";
        case 3:
          return number + "rd";
      }
      return number + "th";
    }

    function addBadges(badgeNames) {
      if (!badgeNames.length) return ["<a:6764_no:1097556585192112149> "];
      const badgeMap = {
        ActiveDeveloper: "<:activedeveloper:1097524725464432750> ",
        BugHunterLevel1: "<:discordbughunter1:1097524730816372766>",
        BugHunterLevel2: "<:discordbughunter2:1097524732691230822>",
        PremiumEarlySupporter: "<:discordearlysupporter:1097524733853040710>",
        Partner: "<:discordpartner:1097524737833447476>",
        Staff: "<:discordstaff:1097524969589719070>",
        HypeSquadOnlineHouse1: "<:hypesquadbravery:1097524744720482395>", // bravery
        HypeSquadOnlineHouse2: "<:hypesquadbrilliance:1097524746490499132>", // brilliance
        HypeSquadOnlineHouse3: "<:hypesquadbalance:1097524742686244975>", // balance
        Hypesquad: "<:hypesquadevents:1097524971565228034>",
        CertifiedModerator: "<:olddiscordmod:1097524751594954792>",
        VerifiedDeveloper: "<:discordbotdev:1097524729201573958>",
        64: "<:discordnitro:1097524736101204108>",
        4194304: "<:discordboost7:1097524727532236820>",
        256: "<:discordnitro:1097524736101204108>",
      };
      return badgeNames.map((badgeName) => badgeMap[badgeName] || "❔");
    }

    if (member.user.bot)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "In this momment you can't do this command! <a:6764_no:1097556585192112149> "
            )
            .setColor("#e4f1ff"),
        ],
        ephemeral: true,
      });

    try {
      const fetchedMembers = await interaction.guild.members.fetch();
      const profileBuffer = await profileImage(member.id);
      const imageAttachment = new AttachmentBuilder(profileBuffer, {
        name: `profile.png`,
      });

      const joinPosition =
        Array.from(
          fetchedMembers
            .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
            .keys()
        ).indexOf(member.id) + 1;

      const topRoles = member.roles.cache
        .sort((a, b) => b.position - a.position)
        .map((role) => role)
        .slice(0, 3);

      const userBadges = member.user.flags.toArray();

      const joinTime = parseInt(member.joinedTimestamp / 1000);
      const createdTime = parseInt(member.user.createdTimestamp / 1000);

      const Booster = member.premiumSince
        ? "<:discordboost7:1097524727532236820>"
        : "<a:6764_no:1097556585192112149> ";
      const Banner = (await member.user.fetch()).bannerURL()
        ? `[Link](${(await member.user.fetch()).bannerURL()})`
        : "<a:6764_no:1097556585192112149> ";

      const Embed = new EmbedBuilder()
        .setAuthor({
          name: `${member.user.username} | General Info`,
          iconURL: member.displayAvatarURL(),
        })
        .setColor("#e4f1ff")
        .setDescription(
          `In <t:${joinTime}:D>, ${
            member.user.username
          } joined the **${addSuffix(joinPosition)}** in this server.`
        )
        .setImage("attachment://profile.png")
        .addFields([
          {
            name: "Badges",
            value: `${addBadges(userBadges).join("")}`,
            inline: true,
          },
          { name: "Booster", value: `${Booster}`, inline: true },
          {
            name: "Top Roles",
            value: `${topRoles.join("").replace(`<@${interaction.guildId}>`)}`,
            inline: false,
          },
          { name: "Created", value: `<t:${createdTime}:R>`, inline: true },
          { name: "Joined", value: `<t:${joinTime}:R>`, inline: true },
          { name: "ID", value: `${member.id}`, inline: false },
          {
            name: "Avatar",
            value: `[Link](${member.displayAvatarURL()})`,
            inline: true,
          },
          {
            name: "Banner",
            value: `${Banner}`,
            inline: true,
          },
        ]);

      interaction.editReply({
        embeds: [Embed],
        files: [imageAttachment],
      });
    } catch (error) {
      interaction.editReply({
        content: "An Error Has Ocurred: Contact with <@300969054649450496>",
      });
      throw error;
    }
  },
};
