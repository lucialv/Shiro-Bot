const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const Usuario = require("../../../schemas/Usuario");
const GuildSchema = require("../../../schemas/GuildSchema");
const config = require("../../../config");
const Item = require("../../../schemas/Item");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("selectrod")
    .setDescription("Select the fishing rod you want to use")
    .addIntegerOption((option) =>
      option
        .setName("rod")
        .setDescription("The fishing rod you want to use")
        .setRequired(true)
        .addChoices(
          { name: "Rod", value: 10 },
          { name: "Expert Rod", value: 11 },
          { name: "Master Rod", value: 12 }
        )
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

      const numeroRod = interaction.options.getInteger("rod");

      // Buscar al usuario en la base de datos
      const usuario = await Usuario.findOne({ idDiscord: userId });

      if (!usuario) {
        return await interaction.reply(
          language === "en"
            ? "I couldn't find your account. Did you run the /start command?"
            : "No he podido encontrar tu cuenta. ¿Has hecho el comando /start?"
        );
      }

      const hasTypeRod = usuario.inventario.some(
        (item) => item.idUso === numeroRod
      );

      if (!hasTypeRod) {
        return await interaction.reply(
          language === "en"
            ? "You don't have that rod in your inventory."
            : "No tienes esa caña en tu inventario."
        );
      }

      //Comprobar si tiene la caña que quiere usar buscando en su inventario un item con idUso igual a numeroRod
      const itemIndex = usuario.inventario
        .map((item, index) => {
          return {
            index,
            item,
          };
        })
        .filter((item) => item.item.idUso === numeroRod)
        .sort((a, b) => a.item.durabilidad - b.item.durabilidad)
        .map((item) => item.index)[0];

      const rod = usuario.inventario[itemIndex];

      //Desactivar todas las demás cañas con idUso igual a 10, 11 y 12

      usuario.inventario.forEach((item) => {
        if (item.idUso === 10 || item.idUso === 11 || item.idUso === 12) {
          item.active = false;
        }
      });

      //Activar la caña seleccionada
      if (itemIndex !== undefined) {
        const newItem = {
          ...usuario.inventario[itemIndex],
          active: true,
        };
        // Agregar el nuevo ítem al inventario
        usuario.inventario.splice(itemIndex, 1);
        usuario.inventario.push(newItem);
      }

      await usuario.save();

      await interaction.reply(
        language === "en"
          ? `You have selected the ${rod.nombre}.`
          : `Has seleccionado la ${rod.nombreES}.`
      );
    } catch (error) {
      console.error("Error al activar la caña:", error);
      await interaction.reply(
        "There was an error while trying to activate a rod. Please contact the developer <@300969054649450496> <3"
      );
    }
  },
};
