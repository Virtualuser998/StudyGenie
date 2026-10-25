const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const authMiddleware =require("../middleware/authMiddleware");
const AINote =require("../models/AINote");
const router = express.Router();

const aiFileUpload = multer({

  storage: multer.memoryStorage(),

  limits: {
    fileSize: 20 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"
    ];

    if (allowedTypes.includes(file.mimetype)) {

      cb(null, true);

    } else {

      cb(
        new Error(
          "Only PDF, DOCX and TXT files are allowed"
        )
      );

    }
  }

});

// ========================================
// GENERATE AI NOTES
// POST /api/ai/generate-notes
// ========================================
const wait = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));


const generateWithFallback = async (ai, prompt) => {

  const models = [
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.6-flash"
  ];

  let lastError;

  for (const model of models) {

    for (let attempt = 1; attempt <= 2; attempt++) {

      try {

        console.log(
          `Trying ${model} - attempt ${attempt}`
        );

        const response =
          await ai.models.generateContent({
            model: model,
            contents: prompt
          });

        return response;

      } catch (error) {

        lastError = error;

        const message =
          error?.message || "";

        const isRetryable =
          error?.status === 503 ||
          error?.code === 503 ||
          message.includes("503") ||
          message.includes("UNAVAILABLE") ||
          message.includes("high demand");

        if (!isRetryable) {
          throw error;
        }

        console.log(
          `${model} busy. Retrying...`
        );

        await wait(
          attempt === 1
            ? 1500
            : 3000
        );
      }
    }
  }

  throw lastError;
};
router.post(
  "/generate-notes",
  authMiddleware,

  async (req, res) => {

    try {

      const {
        text,
        noteType,
        sourceType
      } = req.body;


      if (!text || !text.trim()) {

        return res.status(400).json({
          message:
            "Please provide study content"
        });

      }


      const ai = new GoogleGenAI({
        apiKey:
          process.env.GEMINI_API_KEY
      });


      const selectedNoteType =
        noteType || "Summary";


      const prompt = `
You are StudyGenie, an AI study assistant.

Generate ${selectedNoteType}
from the following study material.

Use simple student-friendly language.

Make the response useful for B.Sc. IT exam preparation.

Use:
- Proper headings
- Important points
- Bullet points where useful
- Clear explanations
- Simple language

Study Material:

${text}
      `;


      // CALL GEMINI

   const response =
    await generateWithFallback(
     ai,
     prompt
  );

      const generatedText =
        response.text;


      // CREATE TITLE FROM INPUT TEXT

      const firstLine =
        text
          .trim()
          .split(/\n|[.!?]/)[0]
          .trim();


      const title =
        firstLine
          ? firstLine.substring(0, 60)
          : `${selectedNoteType} Notes`;


      // SAVE TO MONGODB

      const savedNote =
        new AINote({

          user:
            req.user.id,

          title:
            title,

          sourceType:
            sourceType || "text",

          sourceText:
            text,

          noteType:
            selectedNoteType,

          generatedNotes:
            generatedText

        });


      await savedNote.save();


      // SEND RESPONSE

      res.status(201).json({

        message:
          "Notes generated and saved successfully",

        notes:
          generatedText,

        savedNote:
          savedNote

      });

} catch (error) {

  console.error(
    "Gemini / Save Notes Error:",
    error
  );
    const message =
    error?.message || "";

  const isUnavailable =
    error?.status === 503 ||
    error?.code === 503 ||
    message.includes("503") ||
    message.includes("UNAVAILABLE") ||
    message.includes("high demand");

  if (isUnavailable) {
    return res.status(503).json({
      message:
        "AI service is busy right now. Please try again in a moment."
    });
  }
  res.status(500).json({
    message:
      error.message ||
      "Failed to generate notes"
  });
} 
  }
);

// ========================================
// GET USER AI NOTES HISTORY
// GET /api/ai/notes
// ========================================

router.get(
  "/notes",
  authMiddleware,

  async (req, res) => {

    try {

      const notes =
        await AINote.find({
          user: req.user.id
        })
        .sort({
          createdAt: -1
        });


      res.json(notes);
    } catch (error) {
      console.error(
        "Fetch AI Notes Error:",
        error
      );
      res.status(500).json({
        message:
          "Failed to fetch AI notes"
      });
    }
  }
);
// ========================================
// DELETE AI NOTE
// DELETE /api/ai/notes/:id
// ========================================
router.delete(
  "/notes/:id",
  authMiddleware,

  async (req, res) => {
    try {
      const note = await AINote.findOne({
        _id: req.params.id,
        user: req.user.id
      });

      if (!note) {
        return res.status(404).json({
          message: "AI note not found"
        });
      }

      await AINote.deleteOne({
        _id: note._id
      });


      res.json({ message:"AI note deleted successfully" });
    } catch (error) {
      console.error("Delete AI Note Error:", error);
      res.status(500).json({
        message:"Failed to delete AI note"});
    }
  }
);


// ========================================
// EXTRACT TEXT FROM STUDY FILE
// POST /api/ai/extract-file
// ========================================

router.post(
  "/extract-file",

  authMiddleware,

  aiFileUpload.single("file"),

  async (req, res) => {

    try {

      if (!req.file) {

        return res.status(400).json({
          message: "Please upload a file"
        });

      }


      let extractedText = "";


      // =====================================
      // TXT FILE
      // =====================================

      if (
        req.file.mimetype === "text/plain"
      ) {

        extractedText =
          req.file.buffer.toString("utf8");

      }


      // =====================================
      // PDF FILE
      // =====================================

      else if (
        req.file.mimetype ===
        "application/pdf"
      ) {

        const pdfData =
          await pdfParse(
            req.file.buffer
          );

        extractedText =
          pdfData.text;

      }


      // =====================================
      // DOCX FILE
      // =====================================

      else if (
        req.file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {

        const result =
          await mammoth.extractRawText({
            buffer: req.file.buffer
          });

        extractedText =result.value;

      }

      // =====================================
      // EMPTY TEXT CHECK
      // =====================================

      if (!extractedText.trim()) {
        return res.status(400).json({
          message: "No readable text found in this file"
        });
      }


      res.json({
        message:"File text extracted successfully",
        fileName: req.file.originalname,
        text:extractedText
      });

    } catch (error) {
      console.error(
        "File Extraction Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to read study file"
      });

    }

  }
);


module.exports = router;