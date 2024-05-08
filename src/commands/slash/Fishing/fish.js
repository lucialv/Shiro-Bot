const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  embedLength,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Pez = require("../../../schemas/Pez");
const expUntilNextLevel = require("../../../utility/expUntilNextLevel");
const colorsEmbed = require("../../../utility/colorsEmbed");
const Usuario = require("../../../schemas/Usuario");
const GuildSchema = require("../../../schemas/GuildSchema");
const config = require("../../../config");

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
    .setDescription("Fish a random fish 🎣"),
  options: {
    cooldown: 2000,
  },
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
      const guildId = interaction.guild.id;
      const channelId = interaction.channelId;

      let rodType; // ID de la caña de pescar

      const guildData = await GuildSchema.findOne({ guild: guildId });

      if (!guildData) {
        return await interaction.reply(
          "The fishing channels have not been configured yet. Contact the server administrator to run `/setup`"
        );
      }
      const language = guildData.language;

      if (channelId != guildData.canal_pesca_1) {
        return await interaction.reply(
          language === "en"
            ? "This command can only be executed in fishing channels."
            : "Este comando solo puede ser ejecutado en canales de pesca."
        );
      }
      console.log(channelId, guildData.canal_pesca_1);

      const userId = interaction.user.id;

      let usuario = await Usuario.findOne({ idDiscord: userId });
      if (!usuario) {
        return await interaction.reply(
          language === "en"
            ? "I couldn't find your account. Did you run the /start command?"
            : "No he podido encontrar tu cuenta. ¿Has hecho el comando /start?"
        );
      }

      let hasRod = false;
      let rodBroken = false;

      //mirar si el usuario tiene cañas, para eso se mira si tiene un item con idUso 10, 11 o 12
      const hasRodInInventory = usuario.inventario.some(
        (item) => item.idUso === 10 || item.idUso === 11 || item.idUso === 12
      );

      //mirar si el usuario tiene una caña de pescar en su inventario con active == true
      const hasActiveRodInInventory = usuario.inventario.some(
        (item) => item.active
      );
      if (!hasRodInInventory) {
        return await interaction.reply(
          language === "en"
            ? "You don't have a `Rod`, you need to have one to be able to fish! You can buy one with `/buy 1`"
            : "No tienes una `Caña de pescar`, necesitas tener una para poder pescar! Puedes comprar una con `/buy 1`"
        );
      }
      if (!hasActiveRodInInventory) {
        return await interaction.reply(
          language === "en"
            ? "You don't have an active `Rod`, pls use `/selectrod`"
            : "No tienes una `Caña de pescar` activa, por favor usa `/selectrod`"
        );
      }

      // Buscar el primer ítem con item.active == TRUE en el inventario del usuario y con la menos durabilidad
      const itemIndex = usuario.inventario
        .map((item, index) => {
          return {
            index,
            item,
          };
        })
        .filter((item) => item.item.active)
        .map((item) => item.index)[0];

      if (itemIndex !== undefined) {
        const newItem = {
          ...usuario.inventario[itemIndex],
          durabilidad: usuario.inventario[itemIndex].durabilidad - 1,
        };
        rodType = usuario.inventario[itemIndex].idUso;
        // Agregar el nuevo ítem al inventario
        usuario.inventario.splice(itemIndex, 1);
        usuario.inventario.push(newItem);

        // Si la durabilidad llega a 0, eliminar el ítem del inventario
        if (newItem.durabilidad === 0) {
          usuario.inventario.splice(newItem, 1);
          rodBroken = true;
        }
        hasRod = true;
      }

      if (!hasRod) {
        if (rodType === 10) {
          return await interaction.reply(
            language === "en"
              ? "You don't have a `Rod`, you need to have on to be able to fish! You can buy one with `/buy 1`"
              : "No tienes una `Caña de pescar`, necesitas tener una para poder pescar! Puedes comprar una con `/buy 1`"
          );
        } else if (rodType === 11) {
          return await interaction.reply(
            language === "en"
              ? "You don't have an `Expert rod`, you need to have on to be able to fish! You can buy one with `/buy 2`"
              : "No tienes una `Caña de pescar experta`, necesitas tener una para poder pescar! Puedes comprar una con `/buy 2`"
          );
        } else if (rodType === 12) {
          return await interaction.reply(
            language === "en"
              ? "You don't have an `Master Rod`, you need to have on to be able to fish! You can buy one with `/buy 3`"
              : "No tienes una `Caña de pescar maestra`, necesitas tener una para poder pescar! Puedes comprar una con `/buy 3`"
          );
        }
      }

      const tituloEmbed =
        language === "en" ? "Fishing summary 🎣" : "Resumen de pesca 🎣";
      const rodBrokenMessage =
        language === "en" ? "Your rod broke! 🎣" : "¡Tu caña se ha roto! 🎣";
      const fishedMessage = language === "en" ? "Fished:" : "Pescado:";
      const nadaPescado = language === "en" ? "Nothing 🎣" : "Nada 🎣";
      const pescadoUnPez =
        language === "en" ? "fished a fish! 🎣" : "ha pescado un pez 🎣";
      const galletas = language === "en" ? "Cookies" : "Galletas";
      const intentarPescar =
        language === "en" ? "tried to fish! 🎣" : "intentó pescar! 🎣";
      const pescadoRae = language === "en" ? "Fish" : "Pez";
      const pezEscapao =
        language === "en"
          ? "The fish escaped <:jettcry:1206206360782639144>"
          : "El pez escapó <:jettcry:1206206360782639144>";

      let suerte = Math.floor(Math.random() * 100) + 1;
      if (rodType === 10) {
        suerte = Math.floor(Math.random() * 100) + 1;
      } else if (rodType === 11) {
        suerte = Math.floor(Math.random() * 70) + 1;
      } else if (rodType === 12) {
        suerte = Math.floor(Math.random() * 45) + 1;
      }
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
        if (rodBroken) {
          embed = new EmbedBuilder()
            .setTitle(tituloEmbed)
            .setFooter({
              text: `${interaction.user.username} ${intentarPescar}`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .addFields(
              {
                name: fishedMessage,
                value: nadaPescado,
              },
              {
                name: `Oopss`,
                value: rodBrokenMessage,
              }
            )
            .setColor(colorsEmbed["blue"]);
          await usuario.save();
          return await interaction.reply({ embeds: [embed] });
        } else {
          embed = new EmbedBuilder()
            .setTitle(tituloEmbed)
            .setFooter({
              text: `${interaction.user.username} ${intentarPescar}`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .addFields({
              name: fishedMessage,
              value: nadaPescado,
            })
            .setColor(colorsEmbed["blue"]);
          await usuario.save();
          return await interaction.reply({ embeds: [embed] });
        }
      }

      const pezAleatorio = await Pez.aggregate([
        { $match: { rareza: rarezaAleatoria } },
        { $sample: { size: 1 } },
      ]);
      if (pezAleatorio.length === 0) {
        if (rodBroken) {
          embed = new EmbedBuilder()
            .setTitle(tituloEmbed)
            .addFields(
              {
                name: fishedMessage,
                value: nadaPescado,
              },
              {
                name: `Oopss`,
                value: rodBrokenMessage,
              }
            )
            .setColor(colorsEmbed["blue"]);
          await usuario.save();
          return await interaction.reply({ embeds: [embed] });
        } else {
          embed = new EmbedBuilder()
            .setTitle(tituloEmbed)
            .addFields({
              name: fishedMessage,
              value: nadaPescado,
            })
            .setFooter({
              text: `${interaction.user.username} ${intentarPescar}`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setColor(colorsEmbed["blue"]);
          await usuario.save();
          return await interaction.reply({ embeds: [embed] });
        }
      }

      const pez = pezAleatorio[0];
      let pezNivel = Math.floor(Math.random() * 20) + 1;

      // Calcular la probabilidad de captura basada en la rareza del pez
      let probabilidadCaptura = 0.5; // Probabilidad base
      if (rodType === 12) {
        switch (pez.rareza) {
          case "Common":
            probabilidadCaptura = 1;
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
      } else if (rodType === 11) {
        switch (pez.rareza) {
          case "Common":
            probabilidadCaptura = 0.7;
            break;
          case "Rare":
            probabilidadCaptura = 0.6;
            break;
          case "Very rare":
            probabilidadCaptura = 0.5;
            break;
          case "Epic":
            probabilidadCaptura = 0.4;
            break;
          case "Mitic":
            probabilidadCaptura = 0.2;
            break;
          case "Legendary":
            probabilidadCaptura = 0.05;
            break;
        }
      } else if (rodType === 10) {
        switch (pez.rareza) {
          case "Common":
            probabilidadCaptura = 0.6;
            break;
          case "Rare":
            probabilidadCaptura = 0.5;
            break;
          case "Very rare":
            probabilidadCaptura = 0.4;
            break;
          case "Epic":
            probabilidadCaptura = 0.3;
            break;
          case "Mitic":
            probabilidadCaptura = 0.1;
            break;
          case "Legendary":
            probabilidadCaptura = 0.01;
            break;
        }
      }

      // Determinar si el pez es capturado o no basado en la probabilidad
      let numeroRandom = Math.random();
      const capturado = numeroRandom < probabilidadCaptura;

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
        let dineroGanado;
        if (rarezaAleatoria === "Common") {
          dineroGanado = Math.floor(Math.random() * 10) + 10;
        } else if (rarezaAleatoria === "Rare") {
          dineroGanado = Math.floor(Math.random() * 15) + 15;
        } else if (rarezaAleatoria === "Very rare") {
          dineroGanado = Math.floor(Math.random() * 20) + 20;
        } else if (rarezaAleatoria === "Epic") {
          dineroGanado = Math.floor(Math.random() * 25) + 25;
        } else if (rarezaAleatoria === "Legendary") {
          dineroGanado = Math.floor(Math.random() * 35) + 40;
        } else if (rarezaAleatoria === "Mitic") {
          dineroGanado = Math.floor(Math.random() * 30) + 70;
        }
        if (usuario.donatorPerks) {
          dineroGanado = dineroGanado * 2;
        }
        usuario.dinero += dineroGanado;

        // Encontrar el pez que está seleccionado
        const pezSeleccionado = usuario.peces.find((p) => p.selected);
        if (pezSeleccionado) {
          let expGanada;
          if (rarezaAleatoria === "Common") {
            expGanada = Math.floor(Math.random() * 100) + 1;
          } else if (rarezaAleatoria === "Rare") {
            expGanada = Math.floor(Math.random() * 150) + 1;
          } else if (rarezaAleatoria === "Very rare") {
            expGanada = Math.floor(Math.random() * 200) + 1;
          } else if (rarezaAleatoria === "Epic") {
            expGanada = Math.floor(Math.random() * 250) + 1;
          } else if (rarezaAleatoria === "Legendary") {
            expGanada = Math.floor(Math.random() * 300) + 1;
          } else if (rarezaAleatoria === "Mitic") {
            expGanada = Math.floor(Math.random() * 275) + 1;
          }
          if (usuario.donatorPerks) {
            expGanada = expGanada * 2;
          }
          const expNecesaria = expUntilNextLevel[pezSeleccionado.nivel];
          if (expGanada + pezSeleccionado.exp >= expNecesaria) {
            pezSeleccionado.nivel++;
            expGanada = expGanada + pezSeleccionado.exp - expNecesaria;
            pezSeleccionado.exp = expGanada;
            if (rodBroken) {
              embed = new EmbedBuilder()
                .setTitle(tituloEmbed)
                .addFields(
                  {
                    name: fishedMessage,
                    value: `${pez.nombre} ${generoEmoji} ${rarezaEmoji} - \`${
                      language === "en" ? "Level" : "Nivel"
                    } ${pezNivel}\``,
                  },
                  {
                    name: galletas,
                    value: `+${dineroGanado} 🍪`,
                  },
                  {
                    name: `XP:`,
                    value: `+\`${expGanada}\` xp - \`${
                      language === "en" ? "Level Up" : "Ha subido de nivel"
                    } ${pezSeleccionado.nivel}\`!`,
                  },
                  {
                    name: `Oopss`,
                    value: rodBrokenMessage,
                  }
                )
                .setTimestamp()
                .setFooter({
                  text: `${interaction.user.username} ${pescadoUnPez}`,
                  iconURL: interaction.user.displayAvatarURL(),
                })
                .setColor(colorsEmbed["blue"]);
              await usuario.save();
              await interaction.reply({ embeds: [embed] });
            } else {
              embed = new EmbedBuilder()
                .setTitle(tituloEmbed)
                .addFields(
                  {
                    name: fishedMessage,
                    value: `${pez.nombre} ${generoEmoji} ${rarezaEmoji} - \`${
                      language === "en" ? "Level" : "Nivel"
                    } ${pezNivel}\``,
                  },
                  {
                    name: galletas,
                    value: `+${dineroGanado} 🍪`,
                  },
                  {
                    name: `XP:`,
                    value: `+\`${expGanada}\` xp - \`${
                      language === "en" ? "Level Up" : "Ha subido de nivel"
                    } ${pezSeleccionado.nivel}\`!`,
                  }
                )
                .setTimestamp()
                .setFooter({
                  text: `${interaction.user.username} ${pescadoUnPez}`,
                  iconURL: interaction.user.displayAvatarURL(),
                })
                .setColor(colorsEmbed["blue"]);
              await usuario.save();
              await interaction.reply({ embeds: [embed] });
            }
          } else {
            pezSeleccionado.exp += expGanada;
            if (rodBroken) {
              embed = new EmbedBuilder()
                .setTitle(tituloEmbed)
                .addFields(
                  {
                    name: fishedMessage,
                    value: `${pez.nombre} ${generoEmoji} ${rarezaEmoji} - \`${
                      language === "en" ? "Level" : "Nivel"
                    } ${pezNivel}\``,
                  },
                  {
                    name: galletas,
                    value: `+${dineroGanado} 🍪`,
                  },
                  {
                    name: `XP:`,
                    value: `+\`${expGanada}\` xp`,
                  },
                  {
                    name: `Oopss`,
                    value: rodBrokenMessage,
                  }
                )
                .setTimestamp()
                .setFooter({
                  text: `${interaction.user.username} ${pescadoUnPez}`,
                  iconURL: interaction.user.displayAvatarURL(),
                })
                .setColor(colorsEmbed["blue"]);
              await usuario.save();
              await interaction.reply({ embeds: [embed] });
            } else {
              embed = new EmbedBuilder()
                .setTitle(tituloEmbed)
                .addFields(
                  {
                    name: fishedMessage,
                    value: `${pez.nombre} ${generoEmoji} ${rarezaEmoji} - \`${
                      language === "en" ? "Level" : "Nivel"
                    } ${pezNivel}\``,
                  },
                  {
                    name: galletas,
                    value: `+${dineroGanado} 🍪`,
                  },
                  {
                    name: `XP:`,
                    value: `+\`${expGanada}\` xp`,
                  }
                )
                .setTimestamp()
                .setFooter({
                  text: `${interaction.user.username} ${pescadoUnPez}`,
                  iconURL: interaction.user.displayAvatarURL(),
                })
                .setColor(colorsEmbed["blue"]);
              await usuario.save();
              await interaction.reply({ embeds: [embed] });
            }
          }
        } else {
          if (rodBroken) {
            embed = new EmbedBuilder()
              .setTitle(tituloEmbed)
              .addFields(
                {
                  name: fishedMessage,
                  value: `${pez.nombre} ${generoEmoji} ${rarezaEmoji} - \`${
                    language === "en" ? "Level" : "Nivel"
                  } ${pezNivel}\``,
                },
                {
                  name: galletas,
                  value: `+${dineroGanado} 🍪`,
                },
                {
                  name: `Oopss`,
                  value: rodBrokenMessage,
                }
              )
              .setTimestamp()
              .setFooter({
                text: `${interaction.user.username} ${pescadoUnPez}`,
                iconURL: interaction.user.displayAvatarURL(),
              })
              .setColor(colorsEmbed["blue"]);
            await usuario.save();
            await interaction.reply({ embeds: [embed] });
          } else {
            if (usuario.capturados === 1) {
              embed = new EmbedBuilder()
                .setTitle(tituloEmbed)
                .addFields(
                  {
                    name: fishedMessage,
                    value: `${pez.nombre} ${generoEmoji} ${rarezaEmoji} - \`${
                      language === "en" ? "Level" : "Nivel"
                    } ${pezNivel}\``,
                  },
                  {
                    name: galletas,
                    value: `+${dineroGanado} 🍪`,
                  },
                  {
                    name:
                      language === "en" ? "Congratulations!" : "¡Felicidades!",
                    value:
                      language === "en"
                        ? "You have caught your first fish! 🎣\n\nYou can select them with `/select 1`, the selected fish will earn xp while you fish."
                        : "¡Has capturado tu primer pez! 🎣\n\nPuedes seleccionarlo con `/select 1`, el pez seleccionado ganará experiencia mientras pescas.",
                  }
                )
                .setTimestamp()
                .setFooter({
                  text: `${interaction.user.username} ${pescadoUnPez}`,
                  iconURL: interaction.user.displayAvatarURL(),
                })
                .setColor(colorsEmbed["blue"]);
              await usuario.save();
              await interaction.reply({ embeds: [embed] });
            } else {
              embed = new EmbedBuilder()
                .setTitle(tituloEmbed)
                .addFields(
                  {
                    name: fishedMessage,
                    value: `${pez.nombre} ${generoEmoji} ${rarezaEmoji} - \`${
                      language === "en" ? "Level" : "Nivel"
                    } ${pezNivel}\``,
                  },
                  {
                    name: galletas,
                    value: `+${dineroGanado} 🍪`,
                  }
                )
                .setTimestamp()
                .setFooter({
                  text: `${interaction.user.username} ${pescadoUnPez}`,
                  iconURL: interaction.user.displayAvatarURL(),
                })
                .setColor(colorsEmbed["blue"]);
              await usuario.save();
              await interaction.reply({ embeds: [embed] });
            }
          }
        }
      } else {
        if (rodBroken) {
          embed = new EmbedBuilder()
            .setTitle(tituloEmbed)
            .setDescription(pezEscapao)
            .addFields(
              {
                name: `${pescadoRae}:`,
                value: `- ${pez.nombre} ${generoEmoji} ${rarezaEmoji} - \`${
                  language === "en" ? "Level" : "Nivel"
                } ${pezNivel}\``,
              },
              {
                name: `Oopss`,
                value: rodBrokenMessage,
              }
            )
            .setTimestamp()
            .setFooter({
              text: `${interaction.user.username} ${intentarPescar}`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setColor(colorsEmbed["blue"]);
          await usuario.save();
          await interaction.reply({ embeds: [embed] });
        } else {
          embed = new EmbedBuilder()
            .setTitle(tituloEmbed)
            .setDescription(pezEscapao)
            .addFields({
              name: `${pescadoRae}:`,
              value: `- ${pez.nombre} ${generoEmoji} ${rarezaEmoji} - \`${
                language === "en" ? "Level" : "Nivel"
              } ${pezNivel}\``,
            })
            .setTimestamp()
            .setFooter({
              text: `${interaction.user.username} ${intentarPescar}`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setColor(colorsEmbed["blue"]);
          await usuario.save();
          await interaction.reply({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error("Error al pescar:", error);
      await interaction.reply(
        "There was an error while trying to fish 🎣 Contact the developer <@300969054649450496>"
      );
    }
  },
};
