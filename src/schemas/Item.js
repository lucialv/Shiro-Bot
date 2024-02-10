const { model, Schema } = require("mongoose");

const ItemSchema = new Schema({
  nombre: { type: String, required: true },
  idUso: { type: Number, required: false },
  descripcion: { type: String, required: true },
  durabilidad: { type: Number, required: true },
  tipo: {
    type: String,
    enum: ["Tool", "Armor", "Potion", "Pet", "Utility"],
    required: true,
  },
  precio: { type: Number, required: true },
  emoji: { type: String, required: true },
});

module.exports = model("Item", ItemSchema);
