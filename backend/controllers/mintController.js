const crypto = require("crypto");
const Analysis = require("../models/Analysis");
const NftMint = require("../models/NftMint");
const RewardTransaction = require("../models/RewardTransaction");

const ANALYSIS_REWARD = 10;
const MINT_REWARD = 5;
const QUALITY_BONUS = 20;

const isWalletAddress = (value) => /^0x[a-fA-F0-9]{40}$/.test(String(value || ""));

const buildTxHash = () => `0x${crypto.randomBytes(32).toString("hex")}`;

const mintNft = async (req, res, next) => {
  try {
    const { analysisId, contributorAddress, ipfsMetadataUri } = req.body;

    if (!analysisId) {
      return res.status(400).json({ success: false, message: "analysisId is required" });
    }
    if (!isWalletAddress(contributorAddress)) {
      return res.status(400).json({ success: false, message: "Valid contributorAddress is required" });
    }

    const analysis = await Analysis.findOne({ analysisId });
    if (!analysis) {
      return res.status(404).json({ success: false, message: "Analysis not found" });
    }

    if (!analysis.readyForMinting) {
      return res.status(400).json({
        success: false,
        message: `Analysis quality score (${analysis.qualityScore.overallScore}) below minting threshold (60)`,
      });
    }

    const existingMint = await NftMint.findOne({ analysisId, contributorAddress: contributorAddress.toLowerCase(), status: { $in: ["success", "simulated"] } });
    if (existingMint) {
      return res.json({
        success: true,
        message: "NFT already minted for this analysis and contributor",
        data: existingMint,
      });
    }

    const qualityBonus = analysis.qualityScore.overallScore >= 80 ? QUALITY_BONUS : 0;
    const totalTokensEarned = ANALYSIS_REWARD + MINT_REWARD + qualityBonus;

    const transactionHash = buildTxHash();
    const analysisRewardTxHash = buildTxHash();
    const mintRewardTxHash = buildTxHash();

    const mintRecord = await NftMint.create({
      analysis: analysis._id,
      analysisId,
      contributorAddress: contributorAddress.toLowerCase(),
      contractAddress: process.env.NFT_CONTRACT_ADDRESS || null,
      tokenId: Date.now().toString(),
      transactionHash,
      ipfsMetadataUri: ipfsMetadataUri || null,
      ipfsHash: ipfsMetadataUri ? String(ipfsMetadataUri).replace("ipfs://", "") : null,
      chainId: Number(process.env.CHAIN_ID) || 11155111,
      network: process.env.NETWORK_NAME || "sepolia",
      status: "simulated",
      rewards: {
        analysisReward: ANALYSIS_REWARD,
        mintReward: MINT_REWARD,
        qualityBonus,
        totalTokensEarned,
        analysisRewardTxHash,
        mintRewardTxHash,
      },
      mintedAt: new Date(),
    });

    await RewardTransaction.insertMany([
      {
        walletAddress: contributorAddress.toLowerCase(),
        claimType: "analysis",
        amount: ANALYSIS_REWARD,
        analysisId,
        mintRecord: mintRecord._id,
        transactionHash: analysisRewardTxHash,
        chainId: mintRecord.chainId,
        status: "success",
        claimedAt: new Date(),
      },
      {
        walletAddress: contributorAddress.toLowerCase(),
        claimType: "nft_mint",
        amount: MINT_REWARD,
        analysisId,
        mintRecord: mintRecord._id,
        transactionHash: mintRewardTxHash,
        chainId: mintRecord.chainId,
        status: "success",
        claimedAt: new Date(),
      },
      ...(qualityBonus > 0
        ? [
            {
              walletAddress: contributorAddress.toLowerCase(),
              claimType: "quality_bonus",
              amount: qualityBonus,
              analysisId,
              mintRecord: mintRecord._id,
              transactionHash: buildTxHash(),
              chainId: mintRecord.chainId,
              status: "success",
              claimedAt: new Date(),
            },
          ]
        : []),
    ]);

    return res.json({
      success: true,
      message: "NFT minted successfully with rewards",
      data: {
        analysisId,
        qualityScore: analysis.qualityScore.overallScore,
        contributorAddress: contributorAddress.toLowerCase(),
        rewards: mintRecord.rewards,
        nftDetails: {
          contractAddress: mintRecord.contractAddress,
          tokenId: mintRecord.tokenId,
          transactionHash: mintRecord.transactionHash,
          ipfsHash: mintRecord.ipfsHash,
          metadataUrl: mintRecord.ipfsMetadataUri,
          gasUsed: mintRecord.gasUsed,
        },
        timestamp: new Date().toISOString(),
        platform: "Sepolia Testnet",
      },
    });
  } catch (error) {
    return next(error);
  }
};

const claimRewards = async (req, res, next) => {
  try {
    const { walletAddress } = req.body;

    if (!isWalletAddress(walletAddress)) {
      return res.status(400).json({ success: false, message: "Valid walletAddress is required" });
    }

    const wallet = walletAddress.toLowerCase();
    const claimedRewards = await RewardTransaction.find({ walletAddress: wallet, status: "success" }).sort({ claimedAt: -1 });

    if (!claimedRewards.length) {
      return res.json({
        success: false,
        message: "No pending rewards to claim",
        totalClaimed: 0,
      });
    }

    const totalClaimed = claimedRewards.reduce((sum, item) => sum + (item.amount || 0), 0);

    return res.json({
      success: true,
      message: "Rewards summary retrieved",
      totalClaimed,
      breakdown: {
        analysisRewards: claimedRewards.filter((item) => item.claimType === "analysis").reduce((sum, item) => sum + item.amount, 0),
        mintRewards: claimedRewards.filter((item) => item.claimType === "nft_mint").reduce((sum, item) => sum + item.amount, 0),
        qualityBonuses: claimedRewards.filter((item) => item.claimType === "quality_bonus").reduce((sum, item) => sum + item.amount, 0),
      },
      transactions: claimedRewards,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  mintNft,
  claimRewards,
};
