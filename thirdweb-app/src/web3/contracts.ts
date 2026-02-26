export const DEPLOYED_ADDRESSES = {
  oracleCoordinator: "0x98a02C09E76390B96F8480e2bF440d866d624C25",
  ednaRegistry: "0xB24111fe5166D52D12f03587807a6F214bad7B96",
  ednaNft: "0x08c5273C3848e5efE62bc7A365dF7cd5d8A011A8",
} as const;

export const ORACLE_ABI = [
  "function getAnalysis(string analysisId) view returns (tuple(string analysisId,uint256 qualityScore,bool readyForMint,string resultUri,bytes rawResponse,bytes rawError,uint8 status,uint256 updatedAt))",
] as const;

export const REGISTRY_ABI = [
  "function getRecord(string analysisId) view returns (tuple(string analysisId,address contributor,bytes32 sequenceHash,string metadataURI,uint256 qualityScore,bool oracleVerified,bool minted,uint256 createdAt,uint256 updatedAt))",
  "function isMintable(string analysisId) view returns (bool)",
] as const;

export const NFT_ABI = [
  "function analysisToTokenId(string) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
] as const;
