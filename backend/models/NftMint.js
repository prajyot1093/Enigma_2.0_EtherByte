const mongoose = require("mongoose");

const rewardBreakdownSchema = new mongoose.Schema(
  {
    analysisReward: {
      type: Number,
      default: 0,
      min: 0,
    },
    mintReward: {
      type: Number,
      default: 0,
      min: 0,
    },
    qualityBonus: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalTokensEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    analysisRewardTxHash: {
      type: String,
      trim: true,
      default: null,
    },
    mintRewardTxHash: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { _id: false }
);

const nftMintSchema = new mongoose.Schema(
  {
    analysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Analysis",
      required: true,
      index: true,
    },
    analysisId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    contributorAddress: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^0x[a-f0-9]{40}$/,
      index: true,
    },
    contractAddress: {
      type: String,
      trim: true,
      lowercase: true,
      match: /^0x[a-f0-9]{40}$/,
      default: null,
    },
    tokenId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    transactionHash: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    gasUsed: {
      type: Number,
      min: 0,
      default: null,
    },
    blockNumber: {
      type: Number,
      min: 0,
      default: null,
    },
    ipfsHash: {
      type: String,
      trim: true,
      default: null,
    },
    ipfsMetadataUri: {
      type: String,
      trim: true,
      default: null,
    },
    chainId: {
      type: Number,
      default: 11155111,
      index: true,
    },
    network: {
      type: String,
      trim: true,
      default: "sepolia",
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "simulated"],
      default: "pending",
      index: true,
    },
    error: {
      type: String,
      trim: true,
      default: null,
    },
    rewards: {
      type: rewardBreakdownSchema,
      default: () => ({}),
    },
    mintedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

nftMintSchema.index({ contributorAddress: 1, mintedAt: -1 });

module.exports = mongoose.model("NftMint", nftMintSchema);
