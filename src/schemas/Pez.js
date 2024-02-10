const { model, Schema } = require("mongoose");

const PezSchema = new Schema({
  nombre: String,
  rareza: {
    type: String,
    enum: ["Common", "Rare", "Very rare", "Epic", "Mitic", "Legendary"],
  },
  foto: String,
});

module.exports = model("Pez", PezSchema);
