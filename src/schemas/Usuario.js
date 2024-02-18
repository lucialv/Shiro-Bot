const { model, Schema } = require("mongoose");

const PezSchema = new Schema({
  pezId: { type: Schema.Types.ObjectId, ref: "Pez" },
  nombre: { type: String, required: true },
  genero: { type: String, enum: ["Boy", "Girl"], default: "Girl" },
  exp: { type: Number, default: 0 },
  rareza: {
    type: String,
    enum: ["Common", "Rare", "Very rare", "Epic", "Mitic", "Legendary"],
    required: true,
  },
  nivel: { type: Number, required: true },
  favourite: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
});

const UsuarioSchema = new Schema({
  idDiscord: String,
  nombre: String,
  peces: [PezSchema],
  dinero: { type: Number, default: 0 },
  inventario: { type: Array, required: false },
  donator: { type: Boolean, required: false },
  donatorPerks: { type: Boolean, default: false },
  logros: { type: Array, default: [] },
  capturados: { type: Number, default: 0 },
  startedOn: { type: Date, default: Date.now },
  badges: { type: Array, default: [] },
  lastDaily: { type: Date, required: false },
  dailyStreak: { type: Number, default: 0 },
});

module.exports = model("Usuario", UsuarioSchema);
