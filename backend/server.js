const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();
const app = express();

app.use(cors());
app.use(express.json());


app.get("/",(req, res) => {
        res.send("StudyGenie API Running");
    });

// Authentication Routes
app.use(
    "/api/auth",
    require("./routes/authRoutes")
);

// Study Material Routes
app.use(
  "/api/materials",
  require("./routes/materialRoutes")
);

 // GOOGLE GEMNI AI Routes
 app.use(
  "/api/ai",
  require("./routes/aiRoutes")
);
  app.use(
   "/api/doubts",
   require("./routes/doubtRoutes")
  );

  app.use(
   "/api/quizzes",
   require("./routes/quizRoutes")
  );

const PORT =
    process.env.PORT || 3001;

app.listen(PORT,() => {
        console.log(
            `Server running on http://localhost:${PORT}`
        );
    });