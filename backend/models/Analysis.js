const mongoose = require("mongoose");

const qualityScoreSchema = new mongoose.Schema(
  {
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    variantImpact: {
      type: String,
      trim: true,
      default: null,
    },
    functionalPrediction: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { _id: false }
);

const analysisMetadataSchema = new mongoose.Schema(
  {
    geneName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    contributorAddress: {
      type: String,
      trim: true,
      lowercase: true,
      match: /^0x[a-f0-9]{40}$/,
      default: null,
      index: true,
    },
    sequenceLength: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const analysisSchema = new mongoose.Schema(
  {
    analysisId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    sequenceHash: {
      type: String,
      required: true,
      trim: true,
      index: true,
      minlength: 64,
      maxlength: 64,
    },
    qualityScore: {
      type: qualityScoreSchema,
      required: true,
    },
    geneAnnotations: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    analysisMetadata: {
      type: analysisMetadataSchema,
      required: true,
    },
    processingTime: {
      type: Number,
      required: true,
      min: 0,
    },
    readyForMinting: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
      index: true,
    },
    failureReason: {
      type: String,
      trim: true,
      default: null,
    },
    analyzedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

analysisSchema.index({ "analysisMetadata.contributorAddress": 1, analyzedAt: -1 });
analysisSchema.index({ "analysisMetadata.geneName": 1, analyzedAt: -1 });

module.exports = mongoose.model("Analysis", analysisSchema);
