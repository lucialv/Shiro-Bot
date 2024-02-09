const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Pez = require("../../../schemas/Pez");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("crearpez")
    .setDescription("Crea un nuevo pez")
    .addStringOption((option) =>
      option
        .setName("nombre")
        .setDescription("Nombre del pez")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("rareza")
        .setDescription("Rareza del pez")
        .setRequired(true)
        .addChoices(
          { name: "Común", value: "Común" },
          { name: "Poco común", value: "Poco común" },
          { name: "Raro", value: "Raro" },
          { name: "Épico", value: "Épico" },
          { name: "Legendario", value: "Legendario" },
          { name: "Mítico", value: "Mítico" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("foto")
        .setDescription("URL de la foto del pez")
        .setRequired(true)
    ),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const nombre = interaction.options.getString("nombre");
    const rareza = interaction.options.getString("rareza");
    const foto = interaction.options.getString("foto");

    try {
      const nuevoPez = new Pez({
        nombre,
        rareza,
        foto,
      });

      await nuevoPez.save();

      await interaction.reply(`¡El pez "${nombre}" ha sido creado con éxito!`);
    } catch (error) {
      console.error("Error al crear el pez:", error);
      await interaction.reply("Hubo un error al intentar crear el pez.");
    }
  },
};
