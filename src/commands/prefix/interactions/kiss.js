const { Message, EmbedBuilder } = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Usuario = require("../../../schemas/Usuario"); // Importamos el esquema de usuario
const colorsEmbed = require("../../../utility/colorsEmbed");
const fetch = require("node-fetch");

module.exports = {
  structure: {
    name: "kiss",
    description: "Kiss a user",
    aliases: ["k"],
    cooldown: 1000,
  },
  /**
   * @param {ExtendedClient} client
   * @param {Message<true>} message
   * @param {string[]} args
   */
  run: async (client, message, args) => {
    // Obtener la "víctima" (usuario que recibe el beso)
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

    // Evitamos que alguien se bese a sí mismo
    if (victim.id === message.author.id) {
      return message.reply("¡No puedes besarte a ti mismo!");
    }

    // Buscar los usuarios en la base de datos
    const giver = await Usuario.findOne({ idDiscord: message.author.id });
    const receiver = await Usuario.findOne({ idDiscord: victim.id });

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
    } else if (!giver) {
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

    // Si no se encuentran en la base de datos, podrías agregar lógica para crear un nuevo usuario
    if (!giver || !receiver) {
      return message.reply("Alguno de los usuarios no está registrado.");
    }

    // Actualizamos los besos dados por el que da el beso
    let givenKiss = giver.anime.kisses.find(
      (kiss) => kiss.userId === victim.id
    );
    if (givenKiss) {
      givenKiss.kissCount += 1; // Si ya hay un beso registrado, se incrementa el contador
    } else {
      giver.anime.kisses.push({ userId: victim.id, kissCount: 1 }); // Si no hay, se crea una nueva entrada
      givenKiss = { kissCount: 1 }; // Definimos el contador como 1 para usarlo más adelante
    }

    // Actualizamos los besos recibidos por el que recibe el beso
    let receivedKiss = receiver.anime.kisses.find(
      (kiss) => kiss.userId === message.author.id
    );
    if (receivedKiss) {
      receivedKiss.kissCount += 1; // Incrementamos el contador de besos recibidos
    } else {
      receiver.anime.kisses.push({ userId: message.author.id, kissCount: 1 }); // O se crea una nueva entrada si no existía
    }

    // Guardamos los cambios en la base de datos
    await giver.save();
    await receiver.save();

    // Obtenemos la imagen del beso y luego enviamos el embed
    await fetch("https://nekos.life/api/v2/img/kiss")
      .then((res) => res.json())
      .then((body) => {
        const embed = new EmbedBuilder()
          .setColor(colorsEmbed["blue"])
          .setDescription(
            `${message.author} kissed ${victim} with love <:lulove:1287535811369369680>\n\n They had kissed each other \`${givenKiss.kissCount}\` times!`
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
