const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const Item = require("../../../schemas/Item");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("newitem")
    .setDescription("Crea un nuevo item")
    .addStringOption((option) =>
      option
        .setName("nombre")
        .setDescription("Nombre del nuevo item en ingles")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("nombrees")
        .setDescription("Nombre del nuevo item en español")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("iduso")
        .setDescription("ID de uso del nuevo item")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("descripcion")
        .setDescription("Descripción del nuevo item en ingles")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("descripciones")
        .setDescription("Descripción del nuevo item en español")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("durabilidad")
        .setDescription("Durabilidad del nuevo item")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("tipo")
        .setDescription("Tipo del nuevo item")
        .setRequired(true)
        .addChoices(
          { name: "Tool", value: "Tool" },
          { name: "Armor", value: "Armor" },
          { name: "Potion", value: "Potion" },
          { name: "Pet", value: "Pet" },
          { name: "Utility", value: "Utility" }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName("precio")
        .setDescription("Precio del nuevo item")
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("comprable")
        .setDescription("El item es comprable")
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("usable")
        .setDescription("El item es usable")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("emoji")
        .setDescription("Emoji del nuevo item")
        .setRequired(true)
    ),
  options: {
    developers: true,
  },
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
      const { options } = interaction;

      const nombre = options.getString("nombre");
      const idUso = options.getInteger("iduso");
      const descripcion = options.getString("descripcion");
      const nombreES = options.getString("nombrees");
      const descripcionES = options.getString("descripciones");
      const durabilidad = options.getInteger("durabilidad");
      const comprable = options.getBoolean("comprable");
      const usable = options.getBoolean("usable");
      const tipo = options.getString("tipo");
      const precio = options.getInteger("precio");
      const emoji = options.getString("emoji");

      // Crear un nuevo item en la base de datos
      const newItem = await Item.create({
        nombre,
        nombreES,
        idUso,
        comprable,
        usable,
        descripcion,
        descripcionES,
        durabilidad,
        tipo,
        precio,
        emoji,
      });

      await interaction.reply(`Se ha creado el item ${newItem.nombre}.`);
    } catch (error) {
      console.error("Error al crear el item:", error);
      await interaction.reply("Hubo un error al intentar crear el item.");
    }
  },
};
