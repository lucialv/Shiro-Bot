const { model, Schema } = require("mongoose");

const PezSchema = new Schema({
  nombre: String,
  rareza: {
    type: String,
    enum: ["Común", "Poco común", "Raro", "Épico", "Legendario", "Mítico"],
  },
  foto: String,
});

module.exports = model("Pez", PezSchema);
