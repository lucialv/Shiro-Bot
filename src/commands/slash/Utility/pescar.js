const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Pez = require("../../../schemas/Pez");
const UserPez = require("../../../schemas/UserPez");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("pescar")
    .setDescription("Pesca un pez aleatorio"),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
      // Obtener un pez aleatorio de la base de datos
      const pezAleatorio = await Pez.aggregate([{ $sample: { size: 1 } }]);
      if (pezAleatorio.length === 0) {
        return await interaction.reply(
          "No hay peces disponibles en este momento."
        );
      }

      const pez = pezAleatorio[0];
      const userId = interaction.user.id;
      let pezNivel = Math.floor(Math.random() * 20) + 1;
      // Obtener el contador de capturas del usuario
      let userCaptureCount = await UserPez.countDocuments({ userId });

      // Incrementar el contador de capturas
      userCaptureCount++;

      // Agregar el pez al inventario del usuario en la base de datos
      const userPez = new UserPez({
        userId,
        pezId: pez._id,
        rareza: pez.rareza,
        nivel: pezNivel,
        captureCount: userCaptureCount,
      });
      await userPez.save();

      await interaction.reply(`¡Has pescado un ${pez.nombre}!`);
    } catch (error) {
      console.error("Error al pescar:", error);
      await interaction.reply("Hubo un error al intentar pescar.");
    }
  },
};
