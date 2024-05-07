const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const Usuario = require("../../../schemas/Usuario");
const GuildSchema = require("../../../schemas/GuildSchema");
const config = require("../../../config");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("select")
    .setDescription(
      "Select a fish from your inventory to level up while fishing."
    )
    .addIntegerOption((option) =>
      option
        .setName("id")
        .setDescription("Id of the fish in your inventory")
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
      const numeroPez = interaction.options.getInteger("id");

      // Buscar al usuario en la base de datos
      const usuario = await Usuario.findOne({ idDiscord: userId });

      if (!usuario) {
        if (language === "en") {
          return await interaction.reply(
            "I couldn't find your account. Did you run the /start command?"
          );
        } else {
          return await interaction.reply(
            "No he podido encontrar tu cuenta. ¿Has hecho el comando /start?"
          );
        }
      }

      // Verificar si el usuario tiene peces en su inventario
      if (!usuario.peces || usuario.peces.length === 0) {
        if (language === "en") {
          return await interaction.reply(
            "You don't have any fish in your inventory."
          );
        } else {
          return await interaction.reply(
            "No tienes ningún pez en tu inventario."
          );
        }
      }

      // Verificar si el número del pez es válido
      if (numeroPez <= 0 || numeroPez > usuario.peces.length) {
        if (language === "en") {
          return await interaction.reply(
            "The fish ID you entered is invalid. Please enter a valid ID."
          );
        } else {
          return await interaction.reply(
            "El ID del pez que ingresaste es inválido. Por favor ingresa un ID válido."
          );
        }
      }

      // Verificar si el pez ya está seleccionado
      if (usuario.peces[numeroPez - 1].selected) {
        usuario.peces[numeroPez - 1].selected = false;
        await usuario.save();
        return await interaction.reply(
          language === "en"
            ? `The fish ${
                usuario.peces[numeroPez - 1].nombre
              } has been unselected.`
            : `El pez ${
                usuario.peces[numeroPez - 1].nombre
              } ha sido deseleccionado.`
        );
      }

      // Verificar si el usuario ya tiene un pez seleccionado
      const pezSeleccionado = usuario.peces.find((pez) => pez.selected);
      if (pezSeleccionado) {
        pezSeleccionado.selected = false;
      }

      // Marcar el pez como favorito
      const pezIndex = numeroPez - 1;
      usuario.peces[pezIndex].selected = true;

      // Guardar los cambios en la base de datos
      await usuario.save();

      await interaction.reply(
        `${language === "en" ? "The fish" : "El pez"} \`${
          usuario.peces[numeroPez - 1].nombre
        }\` ${
          language === "en"
            ? "has been selected. You can now level up this fish while fishing."
            : "ha sido seleccionado. Ahora puedes subir de nivel a este pez mientras pescas."
        }`
      );
    } catch (error) {
      console.error("Error al seleccionar pez:", error);
      await interaction.reply(
        "There was an error while trying to select the fish. Pls contact the developer <@300969054649450496> <3"
      );
    }
  },
};
