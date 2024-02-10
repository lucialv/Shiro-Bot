const { model, Schema } = require("mongoose");

const PezSchema = new Schema({
  pezId: { type: Schema.Types.ObjectId, ref: "Pez" },
  nombre: { type: String, required: true },
  rareza: {
    type: String,
    enum: ["Común", "Poco común", "Raro", "Épico", "Legendario", "Mítico"],
    required: true,
  },
  nivel: { type: Number, required: true },
});

const UsuarioSchema = new Schema({
  idDiscord: String,
  nombre: String,
  peces: [PezSchema], // Ahora peces es una matriz de objetos definidos por PezSchema
  dinero: { type: Number, default: 0 },
  inventario: { type: Array, required: false },
  donator: { type: Boolean, required: false },
  capturados: { type: Number, default: 0 },
});

module.exports = model("Usuario", UsuarioSchema);
