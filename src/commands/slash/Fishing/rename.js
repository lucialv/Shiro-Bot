const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const Usuario = require("../../../schemas/Usuario");
const GuildSchema = require("../../../schemas/GuildSchema");
const config = require("../../../config");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("rename")
    .setDescription("Rename a fish of your inventory")
    .addIntegerOption((option) =>
      option
        .setName("id")
        .setDescription("ID of the fish in your inventory")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("new_name")
        .setDescription("New name for the fish")
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
      const nuevoNombre = interaction.options.getString("new_name");

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
            ? "The fish ID you entered is invalid. Please enter a valid ID."
            : "El ID del pez que ingresaste es inválido. Por favor ingresa un ID válido."
        );
      }

      // Marcar el pez como favorito
      const pezIndex = numeroPez - 1;
      usuario.peces[pezIndex].nombre = nuevoNombre;

      // Guardar los cambios en la base de datos
      await usuario.save();

      await interaction.reply(
        `${language === "en" ? "The fish" : "El pez"} \`${numeroPez}\` ${
          language === "en" ? "has been renamed to" : "ha sido renombrado a"
        } \`${nuevoNombre}\`!`
      );
    } catch (error) {
      console.error("Error al renombrar al pez.", error);
      await interaction.reply(
        "There was an error while trying to rename the fish. Pls contact the developer <@300969054649450496> <3"
      );
    }
  },
};
