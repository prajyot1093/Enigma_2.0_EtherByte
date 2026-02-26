const express = require("express");
const { body, query, param } = require("express-validator");
const validateMiddleware = require("../middlewares/validateMiddleware");
const {
  rootInfo,
  healthCheck,
  analyzeSequence,
  getAnalysisById,
  listAnalyses,
} = require("../controllers/analysisController");

const router = express.Router();

router.get("/", rootInfo);
router.get("/health", healthCheck);

router.post(
  "/api/analyze",
  [
    body("sequence")
      .isString()
      .withMessage("sequence must be a string")
      .isLength({ min: 10, max: 50000 })
      .withMessage("sequence length must be 10 to 50000"),
    body("geneName").optional().isString().isLength({ max: 100 }),
    body("description").optional().isString().isLength({ max: 500 }),
    body("contributorAddress").optional().isEthereumAddress().withMessage("contributorAddress must be a valid wallet address"),
  ],
  validateMiddleware,
  analyzeSequence
);

router.get(
  "/api/analysis/:analysisId",
  [param("analysisId").isString().trim().notEmpty().withMessage("analysisId is required")],
  validateMiddleware,
  getAnalysisById
);

router.get(
  "/api/analyses",
  [
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("offset").optional().isInt({ min: 0 }),
  ],
  validateMiddleware,
  listAnalyses
);

module.exports = router;
