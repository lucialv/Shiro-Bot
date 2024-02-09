const { model, Schema } = require("mongoose");

module.exports = model(
  "AmoSchema",
  new Schema({
    count: {
      type: Number,
      default: 0,
    },
  })
);
