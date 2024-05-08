const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const GuildSchema = require("../../../schemas/GuildSchema");
const colorsEmbed = require("../../../utility/colorsEmbed");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("donate")
    .setDescription("Information about how to donate to the developer"),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
      const guildId = interaction.guild.id;
      const guild = await GuildSchema.findOne({ guild: guildId });

      if (!guild) {
        return await interaction.reply(
          "Tell your server administrator to run the /setup command to set up the bot"
        );
      }

      const language = guild.language;

      const link = new ButtonBuilder()
        .setLabel("Donate")
        .setURL("https://github.com/sponsors/lucialv")
        .setStyle(ButtonStyle.Link)
        .setEmoji("<:blue_hearty:1208680843959214161>");

      const row = new ActionRowBuilder().addComponents(link);

      // Manejar las interacciones de botones
      const filter = (interaction) => {
        return interaction.user.id === interaction.user.id;
      };

      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 60000, // Tiempo de espera para la interacción
      });

      const embed = new EmbedBuilder()
        .setColor(colorsEmbed["blue"])
        .setTitle(language === "en" ? "Donate" : "Donar")
        .setDescription(
          language === "en"
            ? "Hi! I'm Lucía, a 16 years old girl from Spain that enjoy coding. I'm the developer of this bot, and I'm always trying to improve it. \n\n I need to pay for host and DB, so if you like the bot and you want to help me, you can donate to me. Thanks for using my bot! <3\n\n If you sponsor me you will have sponsor role in my Discord server and if you use my Bot you will have Donator perks such as:\n- Double XP while fishing\n- Double Cookies while fishing\n- More catch rate\n- <:donator1:1208688704651005963><:donator2:1208688706312208414><:donator3:1208688707528556544><:donator4:1208688709055283210> Badge on your profile"
            : "¡Hola! Soy Lucía, una chica de 16 años de España que disfruta programando. Soy la programadora de este bot y siempre estoy intentando mejorarlo. \n\n Necesito pagar el host y la base de datos, así que si te gusta el bot y quieres ayudarme, puedes donarme. ¡Gracias por usar mi bot! <3\n\n Si me patrocinas tendrás el rol de patrocinador en mi servidor de Discord y si usas mi bot tendrás ventajas de donador como:\n- Doble XP mientras pescas\n- Doble de Galletas mientras pescas\n- Más prob de captura\n- Insignia de <:donator1:1208688704651005963><:donator2:1208688706312208414><:donator3:1208688707528556544><:donator4:1208688709055283210> en tu perfil"
        )
        .setTimestamp()
        .setFooter({
          text: language === "en" ? "Donate" : "Donar",
          iconURL: client.user.displayAvatarURL(),
        });

      await interaction.reply({ embeds: [embed], components: [row] });

      collector.on("end", async () => {
        // Limpiar los botones cuando la colección termina (después de 60 segundos en este caso)
        await interaction.editReply({ components: [] });
      });
    } catch (error) {
      console.error("Error al obtener información para donar:", error);
      await interaction.reply(
        "There was an error while trying to view the bot's donate information. Pls contact the developer <@300969054649450496> <3"
      );
    }
  },
};
