const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const Usuario = require("../../../schemas/Usuario");
const GuildSchema = require("../../../schemas/GuildSchema");
const config = require("../../../config");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("fav")
    .setDescription("Mark a fish in your inventory as favorite")
    .addIntegerOption((option) =>
      option
        .setName("id")
        .setDescription("ID of the fish in your inventory")
        .setRequired(true)
    ),
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

      const numeroPez = interaction.options.getInteger("id");

      // Buscar al usuario en la base de datos
      const usuario = await Usuario.findOne({ idDiscord: userId });

      if (!usuario) {
        return await interaction.reply(
          language === "en"
            ? "I couldn't find your account. Did you run the /start command?"
            : "No he podido encontrar tu cuenta. ¿Has hecho el comando /start?"
        );
      }

      // Verificar si el usuario tiene peces en su inventario
      if (!usuario.peces || usuario.peces.length === 0) {
        return await interaction.reply(
          language === "en"
            ? "You don't have any fish in your inventory."
            : "No tienes ningún pez en tu inventario."
        );
      }

      // Verificar si el número del pez es válido
      if (numeroPez <= 0 || numeroPez > usuario.peces.length) {
        return await interaction.reply(
          language === "en"
            ? "The fish number is invalid."
            : "El número del pez es inválido."
        );
      }
      const pezIndex = numeroPez - 1;

      // Verificar si el pez ya está marcado como favorito
      if (usuario.peces[numeroPez - 1].favourite) {
        usuario.peces[pezIndex].favourite = false;
        await usuario.save();
        return await interaction.reply(
          `${language === "en" ? "The fish" : "El pez"} ${
            usuario.peces[pezIndex].nombre
          } ${
            language === "en"
              ? "has been unmarked as favorite"
              : "ha sido desmarcado como favorito"
          }.`
        );
      }

      // Marcar el pez como favorito
      usuario.peces[pezIndex].favourite = true;

      // Guardar los cambios en la base de datos
      await usuario.save();

      await interaction.reply(
        `${language === "en" ? "The fish" : "El pez"} ${
          usuario.peces[pezIndex].nombre
        } ${
          language === "en"
            ? "has been marked as favorite"
            : "ha sido marcado como favorito"
        }.`
      );
    } catch (error) {
      console.error("Error al marcar el pez como favorito:", error);
      await interaction.reply(
        "There was an error while trying to mark the fish as favorite. Please contact the developer <@300969054649450496> <3"
      );
    }
  },
};
