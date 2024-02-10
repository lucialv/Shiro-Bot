const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Pez = require("../../../schemas/Pez");
const expUntilNextLevel = require("../../../utility/expUntilNextLevel");
const Usuario = require("../../../schemas/Usuario");

const rarezaEmojis = {
  Common:
    "<:common1:1205868965226618980><:common2:1205868966648479824><:common3:1205868967889993759><:common4:1205868968850624634>",
  Rare: "<:rare1:1205877104768716830><:rare2:1205877105875886160><:rare3:1205877106983043113>",
  "Very rare":
    "<:very_rare1:1205877417235709953><:very_rare2:1205877418871623712><:very_rare3:1205877420062675015><:very_rare4:1205877420889215048>",
  Epic: "<:epic1:1205877519958544395><:epic2:1205877521241874492><:epic3:1205877522609213460>",
  Legendary:
    "<:legendary1:1205880191079940107><:legendary2:1205880192451485766><:legendary3:1205880193340801085><:legendary4:1205880194993233940><:legendary5:1205880196180484117><:legendary6:1205880197090639883><:legendary7:1205880198680285186>",
  Mitic:
    "<:mitic1:1205881199545811046><:mitic2:1205881200695316480><:mitic3:1205881201970126868><:mitic4:1205881207653670973><:mitic5:1205881208878145566>",
};

const generoEmojis = {
  Boy: "<:male:1205911279714435143>",
  Girl: "<:female:1205911278791430204>",
};

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

      const suerte = Math.floor(Math.random() * 100) + 1;
      let rarezaAleatoria;
      if (suerte <= 1) {
        rarezaAleatoria = "Legendary";
      } else if (suerte <= 5) {
        rarezaAleatoria = "Mitic";
      } else if (suerte <= 15) {
        rarezaAleatoria = "Epic";
      } else if (suerte <= 30) {
        rarezaAleatoria = "Very rare";
      } else if (suerte <= 50) {
        rarezaAleatoria = "Rare";
      } else if (suerte <= 90) {
        rarezaAleatoria = "Common";
      } else {
        return await interaction.reply(
          "No has logrado capturar ningún pez esta vez."
        );
      }

      const pezAleatorio = await Pez.aggregate([
        { $match: { rareza: rarezaAleatoria } },
        { $sample: { size: 1 } },
      ]);
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
        case "Common":
          probabilidadCaptura = 0.8;
          break;
        case "Rare":
          probabilidadCaptura = 0.7;
          break;
        case "Very rare":
          probabilidadCaptura = 0.6;
          break;
        case "Epic":
          probabilidadCaptura = 0.5;
          break;
        case "Mitic":
          probabilidadCaptura = 0.3;
          break;
        case "Legendary":
          probabilidadCaptura = 0.1;
          break;
      }

      // Determinar si el pez es capturado o no basado en la probabilidad
      const capturado = Math.random() < probabilidadCaptura;

      //Generar Boy or Girl del pez
      let boyOrGirl = Math.floor(Math.random() * 2) + 1;
      let gender = "Girl";
      if (boyOrGirl === 1) {
        gender = "Boy";
      } else {
        gender = "Girl";
      }
      const rarezaEmoji = rarezaEmojis[pez.rareza] || "";
      const generoEmoji = generoEmojis[gender] || "";

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
          genero: gender,
          rareza: pez.rareza,
          nivel: pezNivel,
        });

        // Incrementar el contador de peces capturados
        usuario.capturados++;
        // Añadir dinero al usuario
        const dineroGanado = Math.floor(Math.random() * 20) + 1;
        usuario.dinero += dineroGanado;

        // Encontrar el pez que está seleccionado
        const pezSeleccionado = usuario.peces.find((p) => p.selected);
        if (pezSeleccionado) {
          let expGanada = Math.floor(Math.random() * 100) + 1;
          const expNecesaria = expUntilNextLevel[pezSeleccionado.nivel];
          if (expGanada + pezSeleccionado.exp >= expNecesaria) {
            pezSeleccionado.nivel++;
            expGanada = expGanada + pezSeleccionado.exp - expNecesaria;
            pezSeleccionado.exp = expGanada;
            await usuario.save();
            await interaction.reply(
              `¡Has pescado un ${pez.nombre} ${generoEmoji} ${rarezaEmoji} - Nivel ${pezNivel} y has ganado ${dineroGanado} monedas! Tu ${pezSeleccionado.nombre} ha subido de nivel y ahora es nivel ${pezSeleccionado.nivel}!`
            );
          } else {
            pezSeleccionado.exp += expGanada;
            await usuario.save();
            await interaction.reply(
              `¡Has pescado un ${pez.nombre} ${generoEmoji} ${rarezaEmoji} - Nivel ${pezNivel} y has ganado ${dineroGanado} monedas! Tu ${pezSeleccionado.nombre} ha ganado ${expGanada} de experiencia y ahora tiene ${pezSeleccionado.exp} de experiencia!`
            );
          }
        } else {
          await usuario.save();
          await interaction.reply(
            `¡Has pescado un ${pez.nombre} ${generoEmoji} ${rarezaEmoji} - Nivel ${pezNivel} y has ganado ${dineroGanado} monedas!`
          );
        }
      } else {
        await interaction.reply(
          `Se escapó un ${pez.nombre} ${generoEmoji} ${rarezaEmoji} - Nivel ${pezNivel}!`
        );
      }
    } catch (error) {
      console.error("Error al pescar:", error);
      await interaction.reply("Hubo un error al intentar pescar.");
    }
  },
};
