const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
      required: true
    },
    materialName: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      default: "General"
    },
    score: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
