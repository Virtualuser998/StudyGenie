const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");

const authMiddleware =require("../middleware/authMiddleware");
const AINote =require("../models/AINote");
const Material = require("../models/Material");
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

const isTransientAIError = (error) => {
  const status = Number(error?.status || error?.response?.status || error?.cause?.status);
  const code = [
    error?.code,
    error?.cause?.code,
    error?.cause?.cause?.code
  ].filter(Boolean).join(" ").toLowerCase();
  const message = [
    error?.message,
    error?.cause?.message,
    error?.cause?.cause?.message
  ].filter(Boolean).join(" ").toLowerCase();

  return [408, 425, 429, 500, 502, 503, 504].includes(status)
    || /timeout|fetch failed|network error|econnreset|econnrefused|etimedout|und_err_/.test(`${code} ${message}`);
};

const generateWithFallback = async (ai, prompt, config = {}) => {
  const models = ["gemini-3.8-flash", "gemini-3.6-flash"];
  let lastError;

  for (const model of models) {
    try {
      console.log(`Generating with ${model}`);
      return await ai.models.generateContent({
        model,
        contents: prompt,
        config
      });
    } catch (error) {
      if (!isTransientAIError(error)) throw error;
      lastError = error;
      console.warn(`Gemini ${model} request timed out or was unavailable; trying fallback.`);
      await wait(300);
    }
  }

  throw lastError || new Error("AI service is temporarily unavailable");
};

const extractJsonObject = (rawText) => {
  if (typeof rawText !== "string") return null;
  const text = rawText.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = text.indexOf("{");
  if (start < 0) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const character = text[index];

    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === "\"") inString = false;
      continue;
    }

    if (character === "\"") inString = true;
    else if (character === "{") depth += 1;
    else if (character === "}") {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(text.slice(start, index + 1));
        } catch {
          return null;
        }
      }
    }
  }

  return null;
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
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          timeout: 30000,
          retryOptions: { attempts: 1 }
        }
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

  if (isTransientAIError(error)) {
    return res.status(503).json({
      message:
        "The AI service timed out or is busy. Please try again in a moment."
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
// GENERATE A SUMMARY AND QUIZ FROM A SAVED MATERIAL
// POST /api/ai/material-study-kit
// ========================================
router.post(
  "/material-study-kit",
  authMiddleware,
  async (req, res) => {
    try {
      const { materialId } = req.body;

      if (!/^[a-f\d]{24}$/i.test(materialId || "")) {
        return res.status(400).json({ message: "Choose a valid study material" });
      }

      const material = await Material.findOne({
        _id: materialId,
        user: req.user.id
      });

      if (!material) {
        return res.status(404).json({ message: "Study material not found" });
      }

      const extension = path.extname(material.originalName).toLowerCase();
      const absolutePath = path.isAbsolute(material.filePath)
        ? material.filePath
        : path.resolve(process.cwd(), material.filePath);

      if (!fs.existsSync(absolutePath)) {
        return res.status(404).json({
          message: "The uploaded file is missing. Please upload it again."
        });
      }

      const fileBuffer = await fs.promises.readFile(absolutePath);
      let sourceText = "";

      if (extension === ".txt") {
        sourceText = fileBuffer.toString("utf8");
      } else if (extension === ".pdf") {
        const pdfData = await pdfParse(fileBuffer);
        sourceText = pdfData.text || "";
      } else if (extension === ".docx") {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        sourceText = result.value || "";
      } else {
        return res.status(415).json({
          message: "Quiz generation supports PDF, DOCX, and TXT files."
        });
      }

      sourceText = sourceText.trim();
      if (!sourceText) {
        return res.status(400).json({
          message: "No readable study text was found in this file."
        });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          message: "AI generation is not configured. Add GEMINI_API_KEY in Replit Secrets."
        });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          timeout: 30000,
          retryOptions: { attempts: 1 }
        }
      });
      const prompt = `Create a student-friendly study kit from this material.
Return only valid JSON with this exact shape:
{
  "summary": "A concise markdown summary with headings and key points",
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 0,
      "explanation": "Why the correct option is correct"
    }
  ]
}
Create 3 to 5 multiple-choice questions based only on the source material. Use 5 when the material supports five distinct questions; otherwise return fewer rather than repeating questions or inventing facts.
Each question must have 4 distinct options. The answer must be a zero-based option index.
Do not include facts that are not supported by the material.

Study material:
${sourceText.slice(0, 30000)}`;

      const response = await generateWithFallback(ai, prompt, {
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  answer: { type: "integer" },
                  explanation: { type: "string" }
                },
                required: ["question", "options", "answer", "explanation"]
              }
            }
          },
          required: ["summary", "questions"]
        }
      });
      const studyKit = extractJsonObject(response.text);

      if (!studyKit) {
        return res.status(502).json({
          message: "The AI returned an unreadable quiz. Please try again."
        });
      }

      const validQuestions = Array.isArray(studyKit.questions)
        && studyKit.questions.length >= 3
        && studyKit.questions.length <= 5
        && studyKit.questions.every((question) =>
          typeof question.question === "string"
          && question.question.trim().length > 0
          && Array.isArray(question.options)
          && question.options.length === 4
          && question.options.every((option) => typeof option === "string" && option.trim().length > 0)
          && Number.isInteger(question.answer)
          && question.answer >= 0
          && question.answer < 4
          && typeof question.explanation === "string"
        );

      if (typeof studyKit.summary !== "string" || !studyKit.summary.trim() || !validQuestions) {
        return res.status(502).json({
          message: "The AI returned an incomplete study kit. Please try again."
        });
      }

      const savedNote = await AINote.create({
        user: req.user.id,
        title: `${material.originalName} summary`.slice(0, 60),
        sourceType: "material",
        sourceText: sourceText.slice(0, 30000),
        noteType: "Summary",
        generatedNotes: studyKit.summary
      });

      res.json({
        material: {
          id: material._id,
          originalName: material.originalName,
          subject: material.subject
        },
        summary: studyKit.summary,
        questions: studyKit.questions,
        savedNoteId: savedNote._id
      });
    } catch (error) {
      console.error("Generate Material Study Kit Error:", error);
      if (isTransientAIError(error)) {
        return res.status(503).json({
          message: "The AI service timed out or is busy. Please try again."
        });
      }
      res.status(500).json({
        message: "Could not generate a summary and quiz. Please try again."
      });
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