const { model, Schema } = require("mongoose");

const PezSchema = new Schema({
  nombre: String,
  rareza: {
    type: String,
    enum: ["Common", "Rare", "Very rare", "Epic", "Mitic", "Legendary"],
  },
  foto: String,
  renamed: { type: Boolean, default: false },
});

module.exports = model("Pez", PezSchema);
