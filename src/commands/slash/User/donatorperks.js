const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Usuario = require("../../../schemas/Usuario");
const GuildSchema = require("../../../schemas/GuildSchema");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("donatorperks")
    .setDescription("Enables/Disables the donator perks")
    .addStringOption((option) =>
      option
        .setName("perks")
        .setDescription("enable/disable")
        .setRequired(true)
        .addChoices(
          { name: "Enable", value: "Enable" },
          { name: "Disable", value: "Disable" }
        )
    ),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
      const { options } = interaction;

      const userId = interaction.user.id;
      const guildId = interaction.guild.id;
      const guild = await GuildSchema.findOne({ guild: guildId });
      if (!guild) {
        return await interaction.reply(
          "Tell your server administrator to run the /setup command to set up the bot"
        );
      }
      const language = guild.language;

      const perks = options.getString("perks");

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

      if (!usuario.donator) {
        if (language === "en") {
          return await interaction.reply(
            "You are not a donator. You can't enable/disable the donator perks. Do you want to donate? Do /donate"
          );
        } else {
          return await interaction.reply(
            "No eres donador/a. No puedes habilitar/deshabilitar los beneficios de donador. ¿Quieres donar? Haz /donate"
          );
        }
      }

      if (perks === "Enable" && !usuario.donatorPerks) {
        usuario.donatorPerks = true;
        await usuario.save();
        return await interaction.reply(
          language == "en"
            ? "Donator perks enabled!"
            : "¡Los beneficios de donador han sido habilitados!"
        );
      }

      if (perks === "Disable" && usuario.donatorPerks) {
        usuario.donatorPerks = false;
        await usuario.save();
        return await interaction.reply(
          language == "en"
            ? "Donator perks disabled!"
            : "¡Los beneficios de donador han sido deshabilitados!"
        );
      }

      if (perks === "Enable" && usuario.donatorPerks) {
        return await interaction.reply(
          language == "en"
            ? "Donator perks are already enabled!"
            : "¡Los beneficios de donador ya están habilitados!"
        );
      }

      if (perks === "Disable" && !usuario.donatorPerks) {
        return await interaction.reply(
          language == "en"
            ? "Donator perks are already disabled!"
            : "¡Los beneficios de donador ya están deshabilitados!"
        );
      }
    } catch (error) {
      console.error("Error al hacer benificios de donador", error);
      await interaction.reply(
        "There was an error while trying enable/disable donator perks. Pls contact the developer <@300969054649450496> <3"
      );
    }
  },
};
