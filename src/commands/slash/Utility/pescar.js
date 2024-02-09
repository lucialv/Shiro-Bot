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

      // Calcular la probabilidad de captura basada en la rareza del pez
      let probabilidadCaptura = 0.5; // Probabilidad base
      switch (pez.rareza) {
        case "Común":
          probabilidadCaptura = 0.8;
          break;
        case "Poco común":
          probabilidadCaptura = 0.7;
          break;
        case "Raro":
          probabilidadCaptura = 0.6;
          break;
        case "Épico":
          probabilidadCaptura = 0.5;
          break;
        case "Legendario":
          probabilidadCaptura = 0.3;
          break;
        case "Mítico":
          probabilidadCaptura = 0.1;
          break;
      }

      // Determinar si el pez es capturado o no basado en la probabilidad
      const capturado = Math.random() < probabilidadCaptura;

      if (capturado) {
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
      } else {
        await interaction.reply(`No has logrado capturar ningún pez esta vez.`);
      }
    } catch (error) {
      console.error("Error al pescar:", error);
      await interaction.reply("Hubo un error al intentar pescar.");
    }
  },
};
