const {
  UserContextMenuCommandInteraction,
  ContextMenuCommandBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");

module.exports = {
  structure: new ContextMenuCommandBuilder().setName("Ver perfil").setType(2),
  /**
   * @param {ExtendedClient} client
   * @param {UserContextMenuCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    await interaction.reply({
      content: "En desarrollo!",
    });
  },
};
