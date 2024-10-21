const { Message, EmbedBuilder } = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Usuario = require("../../../schemas/Usuario");
const colorsEmbed = require("../../../utility/colorsEmbed");
const fetch = require("node-fetch");

module.exports = {
  structure: {
    name: "hug",
    description: "Hug a user",
    aliases: ["h"],
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

    // Evitamos que alguien se abrace a sí mismo
    if (victim.id === message.author.id) {
      return message.reply("¡No puedes abrazarte a ti mismo!");
    }

    // Buscar los usuarios en la base de datos
    let giver = await Usuario.findOne({ idDiscord: message.author.id });
    let receiver = await Usuario.findOne({ idDiscord: victim.id });

    // Si el receptor no existe, lo creamos
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

    // Si el dador no existe, lo creamos
    if (!giver) {
      giver = await Usuario.create({
        idDiscord: message.author.id,
        nombre: message.author.username,
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

    // Actualizamos los abrazos dados por el que da el abrazo
    let givenHug = giver.anime.hugs.find((hug) => hug.userId === victim.id);
    if (givenHug) {
      givenHug.hugCount += 1; // Si ya hay un abrazo registrado, se incrementa el contador
    } else {
      giver.anime.hugs.push({ userId: victim.id, hugCount: 1 }); // Si no hay, se crea una nueva entrada
      givenHug = { hugCount: 1 }; // Definimos el contador como 1 para usarlo más adelante
    }

    // Actualizamos los abrazos recibidos por el que recibe el abrazo
    let receivedHug = receiver.anime.hugs.find(
      (hug) => hug.userId === message.author.id
    );
    if (receivedHug) {
      receivedHug.hugCount += 1; // Incrementamos el contador de abrazos recibidos
    } else {
      receiver.anime.hugs.push({ userId: message.author.id, hugCount: 1 }); // O se crea una nueva entrada si no existía
    }

    // Guardamos los cambios en la base de datos
    await giver.save();
    await receiver.save();

    await fetch("https://nekos.life/api/v2/img/hug")
      .then((res) => res.json())
      .then((body) => {
        const hugCount = givenHug ? givenHug.hugCount : 1; // Establece hugCount en 1 si no se encontró un abrazo previo
        const embed = new EmbedBuilder()
          .setColor(colorsEmbed["blue"])
          .setDescription(
            `${message.author} hugs ${victim} <:lulove:1287535811369369680>\n\nThey have hugged each other \`${hugCount}\` times!`
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
