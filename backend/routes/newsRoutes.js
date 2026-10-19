
const express = require("express");

const {
  createNews,
  getNews,
  getNewsById,
  getNewsBySlug,
  updateNews,
  deleteNews,
} = require("../controllers/newsController");

const {
  getAdminNews,
  getAdminNewsById,
} = require("../controllers/adminNewsController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/slug/:slug", getNewsBySlug);
router.get("/", getNews);

// Admin routes must be before router.get("/:id", ...)
router.get("/admin/all", protect, getAdminNews);
router.get("/admin/:id", protect, getAdminNewsById);

// Public article lookup
router.get("/:id", getNewsById);

// Admin create, update, delete
router.post("/", protect, createNews);
router.patch("/:id", protect, updateNews);
router.delete("/:id", protect, deleteNews);

module.exports = router;
