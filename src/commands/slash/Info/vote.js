const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Item = require("../../../schemas/Item");
const Usuario = require("../../../schemas/Usuario");
const GuildSchema = require("../../../schemas/GuildSchema");
const colorsEmbed = require("../../../utility/colorsEmbed");
const config = require("../../../config");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("vote")
    .setDescription("Vote for the bot and claim your vote reward"),
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

      // Buscar el usuario en la base de datos
      const usuario = await Usuario.findOne({ idDiscord: userId });
      if (!usuario) {
        return await interaction.reply(
          language === "en"
            ? "I couldn't find your account. Did you run the /start command?"
            : "No he podido encontrar tu cuenta. ¿Has hecho el comando /start?"
        );
      }

      if (usuario.lastVote) {
        const lastVote = new Date(usuario.lastVote);
        const now = new Date();

        const seconds = Math.floor((lastVote - now) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const halfDays = Math.floor(hours / 12);

        const remainingHours = hours - halfDays * 12;
        const remainingMinutes =
          minutes - halfDays * 12 * 60 - remainingHours * 60;
        const remainingSeconds =
          seconds -
          halfDays * 12 * 60 * 60 -
          remainingHours * 60 * 60 -
          remainingMinutes * 60;

        if (hours === 11 && halfDays === -1) {
          return await interaction.reply(
            language === "en"
              ? `You can claim your vote reward in **${remainingMinutes} minutes** and **${remainingSeconds} seconds**.`
              : `Puedes reclamar tu recompensa por votar en **${remainingMinutes} minutos** y **${remainingSeconds} segundos**.`
          );
        }
        if (hours < 11 && halfDays === -1) {
          return await interaction.reply(
            language === "en"
              ? `You can claim your vote reward in **${remainingHours} hours**, **${remainingMinutes} minutes** and **${remainingSeconds} seconds**.`
              : `Puedes reclamar tu recompensa por votar en **${remainingHours} horas**, **${remainingMinutes} minutos** y **${remainingSeconds} segundos**.`
          );
        }
      }

      const apiKey = config.handler.topgg.apiKey;
      const botId = config.client.id;

      const response = await fetch(
        `https://top.gg/api/bots/${botId}/check?userId=${userId}`,
        {
          headers: {
            Authorization: apiKey,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.voted === 1) {
          // Consultar el item de recompensa diaria idUso 1001
          const chest = await Item.find({ idUso: 1001 });

          // Agregar el item al inventario del usuario
          usuario.inventario.push(chest[0]);
          usuario.lastVote = new Date();
          // Guardar los cambios en el usuario
          await usuario.save();
          embed = new EmbedBuilder()
            .setTitle(
              language === "en"
                ? "Vote reward claimed"
                : "Recompensa por votar reclamada"
            )
            .addFields(
              {
                name: language === "en" ? "You've won:" : "Has ganado:",
                value: `- <:masuno:1208716787148001320> ${
                  language === "en" ? chest[0].nombre : chest[0].nombreES
                } ${chest[0].emoji}`,
              },
              {
                name:
                  language === "en"
                    ? "Thank you for voting!"
                    : "¡Gracias por votar!",
                value:
                  language === "en"
                    ? "You can vote again in 12 hours <:heart_pink:1237816836167307265>"
                    : "Puedes votar de nuevo en 12 horas <:heart_pink:1237816836167307265>",
              }
            )
            .setTimestamp()
            .setFooter({
              text: `${interaction.user.username} ${
                language === "en" ? "vote reward" : "recompensa por votar"
              }`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setColor(colorsEmbed["blue"]);
          return await interaction.reply({ embeds: [embed] });
        } else if (data.voted === 0) {
          const link = new ButtonBuilder()
            .setLabel("Vote")
            .setURL("https://top.gg/bot/1191340237226520576")
            .setStyle(ButtonStyle.Link)
            .setEmoji("<:blue_hearty:1208680843959214161>");

          const row = new ActionRowBuilder().addComponents(link);

          // Manejar las interacciones de botones
          const filter = (interaction) => {
            return interaction.user.id === interaction.user.id;
          };

          const collector = interaction.channel.createMessageComponentCollector(
            {
              filter,
              time: 60000, // Tiempo de espera para la interacción
            }
          );

          const embed = new EmbedBuilder()
            .setColor(colorsEmbed["blue"])
            .setTitle(language === "en" ? "Vote" : "Votar")
            .setDescription(
              language === "en"
                ? "You didn't vote yet. Vote for the bot and claim your vote reward! <3"
                : "No has votado aún. ¡Vota por el bot y reclama tu recompensa por votar! <3"
            )
            .setTimestamp()
            .setFooter({
              text: language === "en" ? "Vote" : "Votar",
              iconURL: client.user.displayAvatarURL(),
            });

          await interaction.reply({ embeds: [embed], components: [row] });

          collector.on("end", async () => {
            // Limpiar los botones cuando la colección termina (después de 60 segundos en este caso)
            await interaction.editReply({ components: [] });
          });
        }
      }
    } catch (error) {
      console.error("Error al comprar un item:", error);
      await interaction.reply(
        "An error occurred while voting. Pls contact the developer <@300969054649450496> <3"
      );
    }
  },
};
