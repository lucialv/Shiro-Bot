const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Item = require("../../../schemas/Item");
const Usuario = require("../../../schemas/Usuario");
const GuildSchema = require("../../../schemas/GuildSchema");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Claim your daily reward"),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
      const userId = interaction.user.id;
      const guildId = interaction.guild.id;
      const guild = await GuildSchema.findOne({ guild: guildId });
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

      if (usuario.lastDaily) {
        const lastDaily = new Date(usuario.lastDaily);
        const now = new Date();

        const seconds = Math.floor((lastDaily - now) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        const horas = hours - days * 24;
        const minutos = minutes - days * 24 * 60 - horas * 60;
        const segundos =
          seconds - days * 24 * 60 * 60 - horas * 60 * 60 - minutos * 60;

        if (hours === 23 && days === -1) {
          return await interaction.reply(
            language === "en"
              ? `You can claim your daily reward in ${minutos} minutes and ${segundos} seconds`
              : `Puedes reclamar tu recompensa diaria en ${minutos} minutos y ${segundos} segundos`
          );
        }
        if (hours < 23 && days === -1) {
          return await interaction.reply(
            language === "en"
              ? `You can claim your daily reward in ${horas} hours, ${minutos} minutes and ${segundos} seconds`
              : `Puedes reclamar tu recompensa diaria en ${horas} horas, ${minutos} minutos y ${segundos} segundos`
          );
        }
        if (days === -2) {
          usuario.dailyStreak++;
        } else if (days <= -3) {
          usuario.dailyStreak = 0;
        }
        console.log(usuario.dailyStreak);
      }
      // Consultar el item de recompensa diaria idUso 1000
      const chest = await Item.find({ idUso: 1000 });

      // Agregar el item al inventario del usuario
      usuario.inventario.push(chest[0]);
      usuario.lastDaily = new Date();

      // Guardar los cambios en el usuario
      await usuario.save();

      embed = new EmbedBuilder()
        .setTitle(
          language === "en"
            ? "Daily reward claimed"
            : "Recompensa diaria reclamada"
        )
        .addFields(
          {
            name: language === "en" ? "You've won:" : "Has ganado:",
            value: `- <:plusone:1208549042775396435> ${
              language === "en" ? chest[0].nombre : chest[0].nombreES
            } ${chest[0].emoji}`,
          },
          {
            name: language === "en" ? "Daily streak" : "Racha diaria",
            value:
              usuario.dailyStreak === "- 0"
                ? "- 0 <:jettcry:1206206360782639144>"
                : `- ${usuario.dailyStreak} <a:streakFire:1208546793382481952>`,
          }
        )

        .setTimestamp()
        .setFooter({
          text: `${interaction.user.username} ${
            language === "en" ? "daily reward" : "recompensa diaria"
          }`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setColor("#FFC0CB");
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error al comprar un item:", error);
      await interaction.reply(
        "An error occurred while buying the item. Pls contact the developer <@300969054649450496> <3"
      );
    }
  },
};
