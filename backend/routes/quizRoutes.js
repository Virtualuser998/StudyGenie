const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Material = require("../models/Material");
const QuizAttempt = require("../models/QuizAttempt");

const router = express.Router();

router.get("/history", authMiddleware, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json(attempts.map((attempt) => ({
      id: String(attempt._id),
      materialId: String(attempt.material),
      materialName: attempt.materialName,
      subject: attempt.subject,
      score: attempt.score,
      total: attempt.total,
      date: attempt.createdAt
    })));
  } catch (error) {
    console.error("Fetch Quiz History Error:", error);
    res.status(500).json({ message: "Could not load quiz history" });
  }
});

router.post("/attempts", authMiddleware, async (req, res) => {
  try {
    const { materialId, score, total } = req.body;

    if (
      !/^[a-f\d]{24}$/i.test(materialId || "")
      || !Number.isInteger(score)
      || !Number.isInteger(total)
      || total < 1
      || total > 50
      || score < 0
      || score > total
    ) {
      return res.status(400).json({ message: "Quiz result is invalid" });
    }

    const material = await Material.findOne({
      _id: materialId,
      user: req.user.id
    }).select("originalName subject");

    if (!material) {
      return res.status(404).json({ message: "Study material not found" });
    }

    const attempt = await QuizAttempt.create({
      user: req.user.id,
      material: material._id,
      materialName: material.originalName,
      subject: material.subject || "General",
      score,
      total
    });

    res.status(201).json({
      id: String(attempt._id),
      materialId: String(attempt.material),
      materialName: attempt.materialName,
      subject: attempt.subject,
      score: attempt.score,
      total: attempt.total,
      date: attempt.createdAt
    });
  } catch (error) {
    console.error("Save Quiz Attempt Error:", error);
    res.status(500).json({ message: "Could not save quiz result" });
  }
});

module.exports = router;
