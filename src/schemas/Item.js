const { model, Schema } = require("mongoose");

const ItemSchema = new Schema({
  nombre: { type: String, required: true },
  nombreES: { type: String, required: true },
  idUso: { type: Number, required: true },
  comprable: { type: Boolean, required: true },
  usable: { type: Boolean, required: true },
  vendible: { type: Boolean, required: true },
  precioVenta: { type: Number, required: false },
  descripcion: { type: String, required: true },
  descripcionES: { type: String, required: true },
  durabilidad: { type: Number, required: true },
  tipo: {
    type: String,
    enum: ["Tool", "Armor", "Potion", "Pet", "Utility"],
    required: true,
  },
  precio: { type: Number, required: true },
  emoji: { type: String, required: true },
  active: { type: Boolean, required: true, default: false },
  activable: { type: Boolean, required: true, default: false },
});
module.exports = model("Item", ItemSchema);
