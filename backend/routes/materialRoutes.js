const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Material = require("../models/Material");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ================================
// MULTER STORAGE CONFIGURATION
// ================================

const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {

    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1E9);

    cb(
      null,
      uniqueName + path.extname(file.originalname)
    );
  }

});


// ================================
// FILE FILTER
// ================================

const fileFilter = (req, file, cb) => {

  const allowedExtensions = [
    ".pdf",
    ".doc",
    ".docx",
    ".ppt",
    ".pptx",
    ".txt"
  ];

  const extension =
    path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(extension)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only PDF, DOC, DOCX, PPT, PPTX and TXT files are allowed"
      )
    );
  }

};


// ================================
// MULTER CONFIGURATION
// ================================

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024
  }

});

// ================================
// UPLOAD MATERIAL
// POST /api/materials/upload
// ================================

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),

  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please select a file"
        });
      }

      const material = new Material({
        user: req.user.id,
        originalName:
          req.file.originalname,

        fileName:
          req.file.filename,

        filePath:
          req.file.path,

        fileType:
          req.file.mimetype,

        fileSize:
          req.file.size,

        subject:
          req.body.subject || "General"

      });

      await material.save();
      res.status(201).json({

        message:
          "Study material uploaded successfully",
        material: material

      });

    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error uploading study material" });
    }

  }
);

// ================================
// GET LOGGED-IN USER MATERIALS
// GET /api/materials

router.get( "/",
  authMiddleware,
  async (req, res) => {

    try {

      const materials =
        await Material.find({
          user: req.user.id
        }).sort({
          createdAt: -1
        });

      res.json(materials);

    } catch (error) {
      console.log(error);
      res.status(500).json({
        message:"Error fetching study materials"
      });
    }
  }
);

// ================================
// DOWNLOAD MATERIAL
// GET /api/materials/:id/download
// ================================

router.get(
  "/:id/download",
  authMiddleware,

  async (req, res) => {

    try {
      const material = await Material.findOne({
        _id: req.params.id,
        user: req.user.id
      });

      if (!material) {
        return res.status(404).json({
          message: "Material not found"
        });
      }

      res.download(
        material.filePath,
        material.originalName
      );

    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error downloading material"
      });
    }

  }
);
// ================================
// DELETE MATERIAL
// DELETE /api/materials/:id
// ================================

router.delete(
  "/:id",
  authMiddleware,

  async (req, res) => {

    try {

      const material = await Material.findOne({
        _id: req.params.id,
        user: req.user.id
      });

      if (!material) {

        return res.status(404).json({
          message: "Material not found"
        });

      }


      // Delete physical file from uploads folder

      const absolutePath = path.resolve(
        material.filePath
      );

      if (fs.existsSync(absolutePath)) {

        fs.unlinkSync(absolutePath);

      }


      // Delete MongoDB record

      await Material.deleteOne({
        _id: material._id
      });


      res.json({
        message: "Material deleted successfully"
      });


    } catch (error) {

      console.log(
        "Delete Material Error:",
        error
      );

      res.status(500).json({
        message: "Error deleting material"
      });

    }

  }
);
module.exports = router;