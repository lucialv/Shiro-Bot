const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const AmoSchema = require("../../../schemas/AmoSchema");
const ExtendedClient = require("../../../class/ExtendedClient");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("teamo")
    .setDescription("Ver cuantas veces hemos dicho te amo"),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const teamoData = await AmoSchema.findOne({});
    await interaction.reply({
      content: "Os habéis dado cariño `" + teamoData.count + "` veces!",
    });
  },
};
