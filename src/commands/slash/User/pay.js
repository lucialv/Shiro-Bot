const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Item = require("../../../schemas/Item");
const Usuario = require("../../../schemas/Usuario");
const GuildSchema = require("../../../schemas/GuildSchema");
const config = require("../../../config");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("pay")
    .setDescription("Pay another user")
    .addUserOption((option) =>
      option.setName("user").setDescription("User to pay").setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("cookies")
        .setDescription("Amount of cookies to pay")
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
        interaction.user.id != config.users.developers
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

      const payUser = interaction.options.getMember("user");
      const cookies = interaction.options.getInteger("cookies"); // Restamos 1 porque la lista de items empieza desde 1 en la interfaz de usuario

      // Buscar el usuario en la base de datos
      const usuario = await Usuario.findOne({ idDiscord: userId });
      const usuarioDestino = await Usuario.findOne({
        idDiscord: payUser.id,
      });

      if (!usuario) {
        return await interaction.reply(
          language === "en"
            ? "I couldn't find your account. Did you run the /start command?"
            : "No he podido encontrar tu cuenta. ¿Has hecho el comando /start?"
        );
      }

      if (!usuarioDestino) {
        return await interaction.reply(
          language === "en"
            ? "I couldn't find the account of the user you want to pay. Did they run the /start command?"
            : "No he podido encontrar la cuenta del usuario al que quieres pagar. ¿Ha hecho el comando /start?"
        );
      }

      // Verificar si el usuario tiene suficiente dinero para comprar el item
      if (usuario.dinero < cookies) {
        return await interaction.reply(
          language === "en"
            ? "You don't have enough cookies to pay this user."
            : "No tienes suficientes cookies para pagar a este usuario."
        );
      }

      // Restar el precio del item del dinero del usuario
      usuario.dinero -= cookies;
      usuarioDestino.dinero += cookies;

      // Guardar los cambios en los usuarios
      await usuario.save();
      await usuarioDestino.save();

      await interaction.reply(
        `${
          language === "en" ? "You have successfully send" : "Acabas de enviar"
        } \`${cookies}\` 🍪 ${language === "en" ? "to" : "a"} <@${payUser.id}> `
      );
    } catch (error) {
      console.error("Error al comprar un item:", error);
      await interaction.reply(
        "An error occurred while paying the user. Pls contact the developer <@300969054649450496> <3"
      );
    }
  },
};
