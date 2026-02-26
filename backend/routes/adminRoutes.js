const express = require("express");
const { body } = require("express-validator");
const validateMiddleware = require("../middlewares/validateMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const {
  loginAdmin,
  getCurrentAdmin,
  createAdmin,
  listAdmins,
} = require("../controllers/adminController");

const router = express.Router();

router.post(
  "/login",
  [body("walletAddress").isEthereumAddress().withMessage("walletAddress must be valid")],
  validateMiddleware,
  loginAdmin
);

router.get("/me", authMiddleware, getCurrentAdmin);
router.get("/", authMiddleware, roleMiddleware("superadmin"), listAdmins);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("superadmin"),
  [
    body("name").isString().trim().notEmpty().withMessage("name is required"),
    body("walletAddress").isEthereumAddress().withMessage("walletAddress must be valid"),
    body("role").optional().isIn(["admin", "superadmin"]),
  ],
  validateMiddleware,
  createAdmin
);

module.exports = router;
