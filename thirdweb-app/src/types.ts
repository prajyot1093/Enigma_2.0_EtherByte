export type Analysis = {
  _id: string;
  analysisId: string;
  sequenceHash: string;
  qualityScore: {
    overallScore: number;
    confidence: number;
    variantImpact?: string;
    functionalPrediction?: string;
  };
  analysisMetadata: {
    geneName?: string;
    description?: string;
    contributorAddress?: string;
    sequenceLength: number;
  };
  readyForMinting: boolean;
  analyzedAt: string;
};
