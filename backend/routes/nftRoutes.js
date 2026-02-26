const express = require("express");
const { body } = require("express-validator");
const validateMiddleware = require("../middlewares/validateMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const { mintNft, claimRewards } = require("../controllers/mintController");

const router = express.Router();

router.post(
  "/mint",
  authMiddleware,
  [
    body("analysisId").isString().trim().notEmpty().withMessage("analysisId is required"),
    body("contributorAddress").isEthereumAddress().withMessage("contributorAddress must be valid"),
    body("ipfsMetadataUri").optional().isString(),
  ],
  validateMiddleware,
  mintNft
);

router.post(
  "/claim-rewards",
  authMiddleware,
  [body("walletAddress").isEthereumAddress().withMessage("walletAddress must be valid")],
  validateMiddleware,
  claimRewards
);

module.exports = router;
