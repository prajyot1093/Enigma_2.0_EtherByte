const mongoose = require("mongoose");

const rewardTransactionSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^0x[a-f0-9]{40}$/,
      index: true,
    },
    claimType: {
      type: String,
      enum: ["analysis", "nft_mint", "quality_bonus", "manual_claim", "validation"],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    tokenSymbol: {
      type: String,
      trim: true,
      default: "GENOME",
    },
    analysisId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    mintRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NftMint",
      default: null,
      index: true,
    },
    transactionHash: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    chainId: {
      type: Number,
      default: 11155111,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
      index: true,
    },
    error: {
      type: String,
      trim: true,
      default: null,
    },
    claimedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

rewardTransactionSchema.index({ walletAddress: 1, claimedAt: -1 });

module.exports = mongoose.model("RewardTransaction", rewardTransactionSchema);
