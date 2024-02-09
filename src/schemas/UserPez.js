const { model, Schema } = require("mongoose");

const UserPezSchema = new Schema({
  userId: { type: String, required: true },
  pezId: { type: Schema.Types.ObjectId, ref: "Pez", required: true },
  rareza: {
    type: String,
    enum: ["Común", "Poco común", "Raro", "Épico", "Legendario", "Mítico"],
    required: true,
  },
  nivel: {
    type: Number,
    min: 1,
    max: 100,
    required: true,
  },
  captureCount: { type: Number, default: 1 },
});

module.exports = model("UserPez", UserPezSchema);
