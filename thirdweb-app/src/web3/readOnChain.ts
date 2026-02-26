import { BrowserProvider, Contract } from "ethers";
import { DEPLOYED_ADDRESSES, NFT_ABI, ORACLE_ABI, REGISTRY_ABI } from "./contracts";

export async function getBrowserProvider() {
  const anyWindow = window as Window & { ethereum?: unknown };
  if (!anyWindow.ethereum) {
    throw new Error("MetaMask not detected");
  }
  const provider = new BrowserProvider(anyWindow.ethereum as any);
  await provider.send("eth_requestAccounts", []);
  return provider;
}

export async function readAnalysisOnChain(analysisId: string) {
  const provider = await getBrowserProvider();

  const oracle = new Contract(DEPLOYED_ADDRESSES.oracleCoordinator, ORACLE_ABI, provider);
  const registry = new Contract(DEPLOYED_ADDRESSES.ednaRegistry, REGISTRY_ABI, provider);
  const nft = new Contract(DEPLOYED_ADDRESSES.ednaNft, NFT_ABI, provider);

  const [oracleData, registryData, mintable, tokenIdBn] = await Promise.all([
    oracle.getAnalysis(analysisId),
    registry.getRecord(analysisId),
    registry.isMintable(analysisId),
    nft.analysisToTokenId(analysisId),
  ]);

  const tokenId = Number(tokenIdBn ?? 0);
  const tokenOwner = tokenId > 0 ? await nft.ownerOf(tokenId) : null;

  return {
    oracle: {
      analysisId: oracleData.analysisId ?? oracleData[0],
      qualityScore: Number(oracleData.qualityScore ?? oracleData[1] ?? 0),
      readyForMint: Boolean(oracleData.readyForMint ?? oracleData[2] ?? false),
      resultUri: oracleData.resultUri ?? oracleData[3] ?? "",
      status: Number(oracleData.status ?? oracleData[6] ?? 0),
      updatedAt: Number(oracleData.updatedAt ?? oracleData[7] ?? 0),
    },
    registry: {
      contributor: registryData.contributor ?? registryData[1],
      metadataURI: registryData.metadataURI ?? registryData[3],
      qualityScore: Number(registryData.qualityScore ?? registryData[4] ?? 0),
      oracleVerified: Boolean(registryData.oracleVerified ?? registryData[5] ?? false),
      minted: Boolean(registryData.minted ?? registryData[6] ?? false),
    },
    mintable: Boolean(mintable),
    tokenId,
    tokenOwner,
  };
}
