const { Message, EmbedBuilder } = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const colorsEmbed = require("../../../utility/colorsEmbed");
const Usuario = require("../../../schemas/Usuario");
const fetch = require("node-fetch");

module.exports = {
  structure: {
    name: "pat",
    description: "Pat a user",
    aliases: ["p"],
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

    if (victim.id === message.author.id) {
      return message.reply("You can't pat yourself!");
    }

    let receiver = await Usuario.findOne({ idDiscord: victim.id });

    if (!receiver) {
      receiver = await Usuario.create({
        idDiscord: victim.id,
        nombre: victim.username,
        dinero: 250,
        inventario: [],
        donator: false,
        capturados: 0,
        peces: [],
        badges: [],
        anime: {
          pats: 0,
          hugs: [],
          kisses: [],
        },
      });
    }

    receiver.anime.pats += 1;

    await receiver.save();

    await fetch("https://nekos.life/api/v2/img/pat")
      .then((res) => res.json())
      .then((body) => {
        const embed = new EmbedBuilder()
          .setColor(colorsEmbed["blue"])
          .setDescription(
            `${message.author} pat ${victim} with love <:lupat:1297862470680973433>\n\n${victim.username} has \`${receiver.anime.pats}\` pats!`
          )
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
