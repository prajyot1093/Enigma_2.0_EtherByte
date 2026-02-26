const { ethers } = require("ethers");

const DEFAULT_CHAIN_ID = 11155111;

const DEFAULT_ADDRESSES = {
  oracle: "0x98a02C09E76390B96F8480e2bF440d866d624C25",
  registry: "0xB24111fe5166D52D12f03587807a6F214bad7B96",
  nft: "0x08c5273C3848e5efE62bc7A365dF7cd5d8A011A8",
};

const ORACLE_ABI = [
  "function requestAnalysis(string analysisId,string sequenceHash,string geneName,string contributorAddress) returns (bytes32)",
  "function getAnalysis(string analysisId) view returns (tuple(string analysisId,uint256 qualityScore,bool readyForMint,string resultUri,bytes rawResponse,bytes rawError,uint8 status,uint256 updatedAt))",
  "function sourceCode() view returns (string)",
];

const REGISTRY_ABI = [
  "function exists(string) view returns (bool)",
  "function registerAnalysis(string analysisId,bytes32 sequenceHash,string metadataURI,address contributor)",
  "function verifyFromOracle(string analysisId,uint256 qualityScore)",
  "function getRecord(string analysisId) view returns (tuple(string analysisId,address contributor,bytes32 sequenceHash,string metadataURI,uint256 qualityScore,bool oracleVerified,bool minted,uint256 createdAt,uint256 updatedAt))",
];

const NFT_ABI = [
  "function mintFromAnalysis(string analysisId,string tokenURI_) returns (uint256 tokenId)",
];

const getConfig = () => {
  return {
    rpcUrl: process.env.SEPOLIA_RPC_URL || "",
    privateKey: process.env.SERVER_WALLET_PRIVATE_KEY || "",
    chainId: Number(process.env.CHAIN_ID || DEFAULT_CHAIN_ID),
    addresses: {
      oracle: process.env.ORACLE_COORDINATOR_ADDRESS || DEFAULT_ADDRESSES.oracle,
      registry: process.env.EDNA_REGISTRY_ADDRESS || DEFAULT_ADDRESSES.registry,
      nft: process.env.EDNA_NFT_ADDRESS || DEFAULT_ADDRESSES.nft,
    },
  };
};

const isConfigured = () => {
  const cfg = getConfig();
  return Boolean(cfg.rpcUrl && cfg.privateKey && cfg.addresses.oracle && cfg.addresses.registry && cfg.addresses.nft);
};

const getContracts = () => {
  const cfg = getConfig();
  if (!isConfigured()) {
    throw new Error("Blockchain service is not configured. Missing RPC/private key or contract addresses.");
  }

  const provider = new ethers.JsonRpcProvider(cfg.rpcUrl, cfg.chainId);
  const signer = new ethers.Wallet(cfg.privateKey, provider);

  const oracle = new ethers.Contract(cfg.addresses.oracle, ORACLE_ABI, signer);
  const registry = new ethers.Contract(cfg.addresses.registry, REGISTRY_ABI, signer);
  const nft = new ethers.Contract(cfg.addresses.nft, NFT_ABI, signer);

  return { cfg, provider, signer, oracle, registry, nft };
};

const toBytes32Hash = (hashHex) => {
  const stripped = String(hashHex || "").replace(/^0x/, "");
  if (!/^[0-9a-fA-F]{64}$/.test(stripped)) {
    throw new Error("Invalid sequence hash for bytes32 conversion");
  }
  return `0x${stripped}`;
};

const registerAndRequestAnalysis = async ({ analysisId, sequenceHash, geneName, contributorAddress, metadataURI, requestOracle = true }) => {
  const { oracle, registry } = getContracts();

  const exists = await registry.exists(analysisId);
  let registerTxHash = null;

  if (!exists) {
    const tx = await registry.registerAnalysis(
      analysisId,
      toBytes32Hash(sequenceHash),
      metadataURI,
      contributorAddress
    );
    const receipt = await tx.wait();
    registerTxHash = receipt.hash;
  }

  let requestTxHash = null;

  if (requestOracle) {
    const requestTx = await oracle.requestAnalysis(
      analysisId,
      `0x${String(sequenceHash).replace(/^0x/, "")}`,
      geneName || "",
      contributorAddress
    );
    const requestReceipt = await requestTx.wait();
    requestTxHash = requestReceipt.hash;
  }

  return {
    registerTxHash,
    requestTxHash,
  };
};

const fetchOracleAnalysis = async (analysisId) => {
  const { oracle } = getContracts();
  const data = await oracle.getAnalysis(analysisId);

  return {
    analysisId: data.analysisId ?? data[0],
    qualityScore: Number(data.qualityScore ?? data[1] ?? 0),
    readyForMint: Boolean(data.readyForMint ?? data[2] ?? false),
    resultUri: data.resultUri ?? data[3] ?? "",
    status: Number(data.status ?? data[6] ?? 0),
    updatedAt: Number(data.updatedAt ?? data[7] ?? 0),
  };
};

const verifyFromOracle = async (analysisId) => {
  const { registry } = getContracts();
  const oracleData = await fetchOracleAnalysis(analysisId);

  if (oracleData.status !== 2) {
    return {
      verified: false,
      reason: "Oracle response not fulfilled yet",
      oracleData,
      verifyTxHash: null,
    };
  }

  const tx = await registry.verifyFromOracle(analysisId, oracleData.qualityScore);
  const receipt = await tx.wait();

  return {
    verified: true,
    oracleData,
    verifyTxHash: receipt.hash,
  };
};

const mintFromAnalysis = async (analysisId, tokenURI = "") => {
  const { nft } = getContracts();
  const tx = await nft.mintFromAnalysis(analysisId, tokenURI);
  const receipt = await tx.wait();

  let tokenId = null;
  try {
    const transferLog = receipt.logs.find((log) => log.topics && log.topics.length === 4);
    if (transferLog?.topics?.[3]) {
      tokenId = Number(BigInt(transferLog.topics[3]));
    }
  } catch (_) {
    tokenId = null;
  }

  return {
    mintTxHash: receipt.hash,
    tokenId,
  };
};

const hasOracleSourceConfigured = async () => {
  try {
    const { oracle } = getContracts();
    const source = await oracle.sourceCode();
    return Boolean(source && String(source).trim().length > 0);
  } catch (_) {
    return false;
  }
};

module.exports = {
  isConfigured,
  registerAndRequestAnalysis,
  fetchOracleAnalysis,
  verifyFromOracle,
  mintFromAnalysis,
  hasOracleSourceConfigured,
};
