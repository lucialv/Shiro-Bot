const { model, Schema } = require("mongoose");

module.exports = model(
  "GuildSchema",
  new Schema({
    guild: {
      type: String,
      required: true,
    },
    prefix: {
      type: String,
    },
    language: {
      type: String,
      enum: ["en", "es"],
      default: "en",
    },
    canal_pesca_1: {
      type: String,
      required: true,
    },
  })
);
