const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const Doubt = require("../models/Doubt");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const geminiModel = () => {
  const configuredModel = process.env.GEMINI_MODEL?.trim();
  return /^gemini-[a-z0-9.-]+$/i.test(configuredModel || "")
    ? configuredModel
    : "gemini-3.8-flash";
};

// =====================================
// NORMALIZE QUESTION
// =====================================
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

// =====================================
// QUESTION SIMILARITY
// =====================================
const calculateSimilarity = (
  question1,
  question2
) => {
  const words1 = new Set(
    normalizeText(question1)
      .split(" ")
      .filter(Boolean)
  );

  const words2 = new Set(
    normalizeText(question2)
      .split(" ")
      .filter(Boolean)
  );
  if (
    words1.size === 0 ||
    words2.size === 0
  ) {
    return 0;
  }
  const intersection =
    [...words1].filter(
      (word) => words2.has(word)
    );
  const union = new Set([
    ...words1,
    ...words2
  ]);
  return (
    intersection.length /
    union.size
  );
};

// =====================================
// GENERATE ANSWER USING GEMINI
// =====================================

const generateDoubtAnswer =
  async (question) => {

    const ai = new GoogleGenAI({
      apiKey:
        process.env.GEMINI_API_KEY
    });


    const prompt = `
You are StudyGenie AI, an academic doubt-solving assistant
for IT students.

Student Question:
${question}

Instructions:
- Answer in simple student-friendly language.
- Explain the concept clearly.
- Use headings where useful.
- Use bullet points where appropriate.
- Give examples when useful.
- Keep the answer suitable for exam preparation.
- Do not unnecessarily make the answer too complicated.
`;


    const response =
      await ai.models.generateContent({
        model:
          geminiModel(),
        contents:
          prompt
      });
    return response.text;
  };
// =====================================
// ASK DOUBT
// POST /api/doubts/ask
// =====================================
router.post(
  "/ask",
  authMiddleware,
  async (req, res) => {
    try {
      const { question } =
        req.body;
      // ===============================
      // VALIDATION
      // ===============================
      if (
        !question ||
        !question.trim()
      ) {
        return res
          .status(400)
          .json({
            message:"Please enter your question"});
      }
      // ===============================
      // GET PREVIOUS QUESTIONS
      // ===============================
      const previousDoubts =
        await Doubt.find({
          user:
            req.user.id
        })
          .sort({
            createdAt: -1
          })
          .limit(100);


      let bestMatch = null;

      let highestSimilarity = 0;


      // ===============================
      // FIND SIMILAR QUESTION
      // ===============================

      previousDoubts.forEach(
        (doubt) => {

          const similarity =
            calculateSimilarity(
              question,
              doubt.question
            );


          if (
            similarity >
            highestSimilarity
          ) {

            highestSimilarity =
              similarity;

            bestMatch =
              doubt;

          }

        }
      );


      console.log(
        "Best Doubt Similarity:",
        highestSimilarity
      );


      // ===============================
      // AUTO FAQ
      // ===============================

      if (
        bestMatch &&
        highestSimilarity >= 0.65
      ) {

        console.log(
          "Answer returned from history"
        );


        return res.json({

          message:
            "Answer found in doubt history",

          answer:
            bestMatch.answer,

          source:
            "history",

          matchedQuestion:
            bestMatch.question,

          similarity:
            highestSimilarity

        });

      }


      // ===============================
      // ASK GEMINI
      // ===============================

      console.log(
        "No similar doubt found."
      );

      console.log(
        "Sending question to Gemini..."
      );


      const answer =
        await generateDoubtAnswer(
          question
        );


      // ===============================
      // SAVE NEW DOUBT
      // ===============================

      const savedDoubt =
        new Doubt({

          user:
            req.user.id,

          question:
            question.trim(),

          answer:
            answer,

          source:
            "gemini"

        });


      await savedDoubt.save();


      console.log(
        "New doubt saved in MongoDB"
      );


      // ===============================
      // RESPONSE
      // ===============================

      res
        .status(201)
        .json({

          message:
            "Doubt solved successfully",

          answer:
            answer,

          source:
            "gemini",

          doubt:
            savedDoubt

        });


    } catch (error) {

      console.error(
        "Doubt Solver Error:",
        error
      );


      res
        .status(500)
        .json({

          message:
            error.message ||
            "Failed to solve doubt"

        });

    }

  }
);


// =====================================
// GET DOUBT HISTORY
// GET /api/doubts
// =====================================

router.get(
  "/",
  authMiddleware,

  async (req, res) => {

    try {

      const doubts =
        await Doubt.find({

          user:
            req.user.id

        })
          .sort({

            createdAt: -1

          });


      res.json(
        doubts
      );


    } catch (error) {

      console.error(
        "Fetch Doubts Error:",
        error
      );


      res
        .status(500)
        .json({

          message:
            "Failed to fetch doubt history"

        });

    }

  }
);


// =====================================
// DELETE DOUBT
// DELETE /api/doubts/:id
// =====================================

router.delete(
  "/:id",
  authMiddleware,

  async (req, res) => {

    try {

      const doubt =
        await Doubt.findOne({

          _id:
            req.params.id,

          user:
            req.user.id

        });


      if (!doubt) {

        return res
          .status(404)
          .json({

            message:
              "Doubt not found"

          });

      }


      await Doubt.deleteOne({

        _id:
          doubt._id

      });


      res.json({

        message:
          "Doubt deleted successfully"

      });


    } catch (error) {

      console.error(
        "Delete Doubt Error:",
        error
      );


      res
        .status(500)
        .json({

          message:
            "Failed to delete doubt"

        });

    }

  }
);


module.exports = router;