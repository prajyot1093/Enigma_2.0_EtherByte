// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IOracleCoordinatorLite {
    function isReadyForMint(string calldata analysisId) external view returns (bool);
}

contract EDNARegistry is Ownable {
    struct AnalysisRecord {
        string analysisId;
        address contributor;
        bytes32 sequenceHash;
        string metadataURI;
        uint256 qualityScore;
        bool oracleVerified;
        bool minted;
        uint256 createdAt;
        uint256 updatedAt;
    }

    address public oracleCoordinator;
    address public nftContract;

    mapping(string => AnalysisRecord) private records;
    mapping(string => bool) public exists;

    event OracleCoordinatorUpdated(address indexed oldOracle, address indexed newOracle);
    event NFTContractUpdated(address indexed oldNFT, address indexed newNFT);
    event AnalysisRegistered(
        string indexed analysisId,
        address indexed contributor,
        bytes32 sequenceHash,
        string metadataURI
    );
    event AnalysisOracleVerified(string indexed analysisId, bool verified, uint256 qualityScore);
    event AnalysisMintedMarked(string indexed analysisId, uint256 tokenId);
    event MetadataURIUpdated(string indexed analysisId, string newMetadataURI);

    modifier onlyNFTContract() {
        require(msg.sender == nftContract, "Only NFT contract");
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {}

    function setOracleCoordinator(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Invalid oracle address");
        address old = oracleCoordinator;
        oracleCoordinator = newOracle;
        emit OracleCoordinatorUpdated(old, newOracle);
    }

    function setNFTContract(address newNFT) external onlyOwner {
        require(newNFT != address(0), "Invalid NFT address");
        address old = nftContract;
        nftContract = newNFT;
        emit NFTContractUpdated(old, newNFT);
    }

    function registerAnalysis(
        string calldata analysisId,
        bytes32 sequenceHash,
        string calldata metadataURI,
        address contributor
    ) external onlyOwner {
        require(bytes(analysisId).length > 0, "analysisId required");
        require(!exists[analysisId], "analysis already exists");
        require(contributor != address(0), "invalid contributor");

        exists[analysisId] = true;
        records[analysisId] = AnalysisRecord({
            analysisId: analysisId,
            contributor: contributor,
            sequenceHash: sequenceHash,
            metadataURI: metadataURI,
            qualityScore: 0,
            oracleVerified: false,
            minted: false,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        emit AnalysisRegistered(analysisId, contributor, sequenceHash, metadataURI);
    }

    function updateMetadataURI(string calldata analysisId, string calldata newMetadataURI) external onlyOwner {
        require(exists[analysisId], "analysis not found");
        records[analysisId].metadataURI = newMetadataURI;
        records[analysisId].updatedAt = block.timestamp;
        emit MetadataURIUpdated(analysisId, newMetadataURI);
    }

    function verifyFromOracle(string calldata analysisId, uint256 qualityScore) external onlyOwner {
        require(exists[analysisId], "analysis not found");
        require(oracleCoordinator != address(0), "oracle not configured");

        bool ready = IOracleCoordinatorLite(oracleCoordinator).isReadyForMint(analysisId);
        records[analysisId].oracleVerified = ready;
        records[analysisId].qualityScore = qualityScore;
        records[analysisId].updatedAt = block.timestamp;

        emit AnalysisOracleVerified(analysisId, ready, qualityScore);
    }

    function markMinted(string calldata analysisId, uint256 tokenId) external onlyNFTContract {
        require(exists[analysisId], "analysis not found");
        require(records[analysisId].oracleVerified, "analysis not verified");
        require(!records[analysisId].minted, "already minted");

        records[analysisId].minted = true;
        records[analysisId].updatedAt = block.timestamp;

        emit AnalysisMintedMarked(analysisId, tokenId);
    }

    function getRecord(string calldata analysisId) external view returns (AnalysisRecord memory) {
        require(exists[analysisId], "analysis not found");
        return records[analysisId];
    }

    function isMintable(string calldata analysisId) external view returns (bool) {
        if (!exists[analysisId]) return false;
        AnalysisRecord memory rec = records[analysisId];
        return rec.oracleVerified && !rec.minted;
    }
}
