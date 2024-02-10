const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Pez = require("../../../schemas/Pez");
const Usuario = require("../../../schemas/Usuario");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("fish")
    .setDescription("Pesca un pez aleatorio"),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
      const userId = interaction.user.id;

      // Obtener un pez aleatorio de la base de datos
      const pezAleatorio = await Pez.aggregate([{ $sample: { size: 1 } }]);
      if (pezAleatorio.length === 0) {
        return await interaction.reply(
          "No hay peces disponibles en este momento."
        );
      }

      const pez = pezAleatorio[0];
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
        // Obtener el usuario actual o crear uno nuevo si no existe
        let usuario = await Usuario.findOne({ idDiscord: userId });
        if (!usuario) {
          usuario = await Usuario.create({
            idDiscord: userId,
            nombre: interaction.user.username,
            dinero: 0,
            inventario: [],
            donator: false,
            capturados: 0, // Añadimos el contador de peces capturados
          });
        }

        // Agregar los atributos del pez capturado al usuario
        usuario.peces.push({
          pezId: pez._id,
          nombre: pez.nombre,
          rareza: pez.rareza,
          nivel: pezNivel,
        });

        // Incrementar el contador de peces capturados
        usuario.capturados++;

        // Añadir dinero al usuario
        const dineroGanado = Math.floor(Math.random() * 20) + 1;
        usuario.dinero += dineroGanado;

        await usuario.save();

        await interaction.reply(
          `¡Has pescado un ${pez.nombre} y has ganado ${dineroGanado} monedas!`
        );
      } else {
        await interaction.reply(`No has logrado capturar ningún pez esta vez.`);
      }
    } catch (error) {
      console.error("Error al pescar:", error);
      await interaction.reply("Hubo un error al intentar pescar.");
    }
  },
};
