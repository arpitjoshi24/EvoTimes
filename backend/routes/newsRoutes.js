const express = require("express");
const multer = require("multer");

const {
  createNews,
  getNews,
  getNewsById,
  getNewsBySlug,
  updateNews,
  deleteNews,
} = require("../controllers/newsController");
const { uploadAdminNewsImage } = require("../controllers/adminNewsController");
const {
  getAdminNews,
  getAdminNewsById,
} = require("../controllers/adminNewsController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.memoryStorage();

const imageUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG and WebP images are allowed"));
    }
  },
}).single("image");

function handleImageUpload(req, res, next) {
  imageUpload(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "Image must be smaller than 5 MB"
            : error.message,
      });
    }

    next();
  });
}

// Public routes
router.get("/slug/:slug", getNewsBySlug);
router.get("/", getNews);

// Admin routes must be before router.get("/:id", ...)
router.post("/upload-image", protect, handleImageUpload, uploadAdminNewsImage);
router.get("/admin/all", protect, getAdminNews);
router.get("/admin/:id", protect, getAdminNewsById);

// Public article lookup
router.get("/:id", getNewsById);

// Admin create, update, delete
router.post("/", protect, createNews);
router.patch("/:id", protect, updateNews);
router.delete("/:id", protect, deleteNews);

module.exports = router;
