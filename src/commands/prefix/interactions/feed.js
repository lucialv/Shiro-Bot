const { Message, EmbedBuilder } = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const colorsEmbed = require("../../../utility/colorsEmbed");
const fetch = require("node-fetch");

module.exports = {
  structure: {
    name: "feed",
    description: "Feed a user",
    aliases: ["f"],
    cooldown: 1000,
  },
  /**
   * @param {ExtendedClient} client
   * @param {Message<true>} message
   * @param {string[]} args
   */
  run: async (client, message, args) => {
    let victim =
      message.mentions.users.first() ||
      (args.length > 0
        ? message.users.cache
            .filter((e) =>
              e.username.toLowerCase().includes(args.join(" ").toLowerCase())
            )
            .first()
        : message.author) ||
      message.author;

    await fetch("https://nekos.life/api/v2/img/feed")
      .then((res) => res.json())
      .then((body) => {
        const embed = new EmbedBuilder()
          .setColor(colorsEmbed["blue"])
          .setDescription(`${message.author} feeds ${victim}`)
          .setImage(body.url)
          .setTimestamp()
          .setFooter({
            text: `Requested by ${message.author.tag}`,
            iconURL: message.author.displayAvatarURL(),
          });

        message.reply({
          embeds: [embed],
        });
      });
  },
};
