const { model, Schema } = require("mongoose");

const UsuarioSchema = new Schema({
  idDiscord: String, // ID de Discord del usuario
  nombre: String,
  peces: [{ type: Schema.Types.ObjectId, ref: "Pez" }], // Referencia a los peces que tiene el usuario
});

module.exports = model("Usuario", UsuarioSchema);
