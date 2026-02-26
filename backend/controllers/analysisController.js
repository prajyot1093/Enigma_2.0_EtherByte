const crypto = require("crypto");
const Analysis = require("../models/Analysis");
const {
  isConfigured: isBlockchainConfigured,
  registerAndRequestAnalysis,
  hasOracleSourceConfigured,
} = require("../services/blockchainService");

const VALID_DNA_CHARS = new Set("ATCGNRYSWKMBDHV-");

const generateAnalysisId = (sequence, geneName = "") => {
  const content = `${sequence}_${geneName}_${new Date().toISOString()}`;
  return crypto.createHash("sha256").update(content).digest("hex").slice(0, 16);
};

const calculateSequenceHash = (sequence) => {
  return crypto.createHash("sha256").update(sequence).digest("hex");
};

const normalizeSequence = (sequence) => {
  const normalized = String(sequence || "").trim().toUpperCase();
  if (normalized.length < 10 || normalized.length > 50000) {
    const error = new Error("Sequence length must be between 10 and 50000 characters");
    error.statusCode = 400;
    throw error;
  }

  const isValid = normalized.split("").every((char) => VALID_DNA_CHARS.has(char));
  if (!isValid) {
    const error = new Error("Invalid DNA sequence characters");
    error.statusCode = 400;
    throw error;
  }

  return normalized;
};

const scoreSequence = (sequence) => {
  const length = sequence.length;
  const gcContent = length ? (sequence.split("G").length - 1 + (sequence.split("C").length - 1)) / length : 0;
  const complexity = new Set(sequence.split("")).size;

  const lengthScore = Math.min(length / 1000, 1) * 30;
  const gcScore = (1 - Math.abs(gcContent - 0.5) * 2) * 30;
  const complexityScore = Math.min(complexity / 4, 1) * 40;

  const overallScore = Math.max(0, Math.min(100, lengthScore + gcScore + complexityScore));
  const confidence = Math.min(overallScore / 100, 0.95);

  return {
    qualityScore: {
      overallScore: Number(overallScore.toFixed(2)),
      confidence: Number(confidence.toFixed(3)),
      variantImpact: overallScore > 60 ? "moderate" : "low",
      functionalPrediction: overallScore > 80 ? "likely_pathogenic" : "uncertain",
    },
    geneAnnotations: {
      gcContent: Number(gcContent.toFixed(3)),
      length,
      complexity,
    },
  };
};

const rootInfo = async (req, res) => {
  return res.json({
    success: true,
    message: "E-DNA Analysis API",
    status: "operational",
    timestamp: new Date().toISOString(),
  });
};

const healthCheck = async (req, res) => {
  return res.json({
    success: true,
    status: "healthy",
    services: {
      mongodb: "connected",
      analysisEngine: "ready",
    },
    timestamp: new Date().toISOString(),
  });
};

const analyzeSequence = async (req, res, next) => {
  try {
    const startedAt = Date.now();
    const { sequence, geneName, description, contributorAddress } = req.body;

    if (!isBlockchainConfigured()) {
      return res.status(503).json({
        success: false,
        message: "Blockchain service is not configured. Analysis submission is disabled until on-chain anchoring is available.",
      });
    }

    const normalizedSequence = normalizeSequence(sequence);
    const analysisId = generateAnalysisId(normalizedSequence, geneName);
    const sequenceHash = calculateSequenceHash(normalizedSequence);

    const scoring = scoreSequence(normalizedSequence);
    const readyForMinting = scoring.qualityScore.overallScore >= 60;
    const processingTime = (Date.now() - startedAt) / 1000;

    const normalizedContributor = contributorAddress ? String(contributorAddress).toLowerCase() : null;

    const analysis = await Analysis.create({
      analysisId,
      sequenceHash,
      qualityScore: scoring.qualityScore,
      geneAnnotations: scoring.geneAnnotations,
      analysisMetadata: {
        geneName: geneName || null,
        description: description || null,
        contributorAddress: normalizedContributor,
        sequenceLength: normalizedSequence.length,
      },
      processingTime,
      readyForMinting,
      status: "completed",
      analyzedAt: new Date(),
    });

    const oracleSourceSet = await hasOracleSourceConfigured();
    const metadataURI = `ipfs://analysis-${analysisId}`;
    const chainResult = await registerAndRequestAnalysis({
      analysisId,
      sequenceHash,
      geneName,
      contributorAddress: normalizedContributor,
      metadataURI,
      requestOracle: oracleSourceSet,
    });

    const blockchain = {
      enabled: true,
      anchored: true,
      requested: oracleSourceSet,
      ...chainResult,
      ...(oracleSourceSet ? {} : { reason: "Oracle source code is not configured on contract" }),
    };

    return res.status(201).json({
      success: true,
      message: "Sequence analyzed and on-chain transaction recorded",
      data: {
        analysis,
        blockchain,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getAnalysisById = async (req, res, next) => {
  try {
    const { analysisId } = req.params;
    const analysis = await Analysis.findOne({ analysisId });

    if (!analysis) {
      return res.status(404).json({ success: false, message: "Analysis not found" });
    }

    return res.json({ success: true, data: analysis });
  } catch (error) {
    return next(error);
  }
};

const listAnalyses = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const [items, total] = await Promise.all([
      Analysis.find().sort({ analyzedAt: -1 }).skip(offset).limit(limit),
      Analysis.countDocuments(),
    ]);

    return res.json({
      success: true,
      data: items,
      pagination: {
        limit,
        offset,
        total,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  rootInfo,
  healthCheck,
  analyzeSequence,
  getAnalysisById,
  listAnalyses,
};
