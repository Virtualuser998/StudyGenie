const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    originalName: {
      type: String,
      required: true
    },

    fileName: {
      type: String,
      required: true
    },

    filePath: {
      type: String,
      required: true
    },

    fileType: {
      type: String,
      required: true
    },

    fileSize: {
      type: Number,
      required: true
    },

    subject: {
      type: String,
      default: "General"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Material",
  materialSchema
);