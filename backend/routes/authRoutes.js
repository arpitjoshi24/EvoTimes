
const express = require("express");
const {
  adminRegister,
  adminLogin,
  me,
  logout,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/admin-register", adminRegister);
router.post("/admin-login", adminLogin);
router.get("/me", protect, me);
router.post("/logout", protect, logout);

module.exports = router;
