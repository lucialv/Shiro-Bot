const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Usuario = require("../../../schemas/Usuario");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Make a coinflip to win or lose money!")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of money you want to bet")
        .setRequired(true)
    ),

  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
      const userId = interaction.user.id;

      // Buscar al usuario en la base de datos
      const usuario = await Usuario.findOne({ idDiscord: userId });
      if (!usuario) {
        return await interaction.reply(
          "I couldn't find your account. Did you run the /start command?"
        );
      }

      const dineroApostado = interaction.options.getInteger("amount");

      //numero random entre 1 y 2
      const caraGanadora = Math.floor(Math.random() * 2) + 1 === 1;

      if (dineroApostado > usuario.dinero) {
        return await interaction.reply(
          "You don't have enough money to bet that amount!"
        );
      }

      if (dineroApostado <= 0) {
        return await interaction.reply("You can't bet 0 or negative money!");
      }

      if (caraGanadora) {
        usuario.dinero += dineroApostado;
        await usuario.save();
        const embed = new EmbedBuilder()
          .setTitle("Coinflip")
          .setDescription(
            `You won the coinflip <a:check:1206885683474599936> \n You won \`${dineroApostado}\` 🍪 \n Now you have 
            \`${usuario.dinero}\` 🍪`
          )
          .setColor("#FFC0CB")
          .setFooter({
            text: `${interaction.user.username} won a coinflip 🍪`,
            iconURL: interaction.user.displayAvatarURL(),
          });
        await interaction.reply({ embeds: [embed.toJSON()] });
      } else {
        usuario.dinero -= dineroApostado;
        await usuario.save();
        const embed = new EmbedBuilder()
          .setTitle("Coinflip")
          .setDescription(
            `You didn't win <a:failed_cross:1206884378005995521> \n You lost \`${dineroApostado}\` 🍪 \n Now you have 
            \`${usuario.dinero}\` 🍪`
          )
          .setColor("#FFC0CB")
          .setFooter({
            text: `${interaction.user.username} lost a coinflip 🍪`,
            iconURL: interaction.user.displayAvatarURL(),
          });
        await interaction.reply({ embeds: [embed.toJSON()] });
      }
    } catch (error) {
      console.error("Error al ver el dinero:", error);
      await interaction.reply(
        "There was an error while trying to do a coinflip. Pls contact the developer <@300969054649450496> <3"
      );
    }
  },
};
