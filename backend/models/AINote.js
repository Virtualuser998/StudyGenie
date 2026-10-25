const mongoose = require("mongoose");

const aiNoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      required: true
    },

    sourceType: {
      type: String,
      default: "text"
    },

    sourceText: {
      type: String,
      required: true
    },

    noteType: {
      type: String,
      default: "Summary"
    },

    generatedNotes: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "AINote",
  aiNoteSchema
);