// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IEDNARegistry {
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

    function getRecord(string calldata analysisId) external view returns (AnalysisRecord memory);
    function markMinted(string calldata analysisId, uint256 tokenId) external;
}

contract EDNANFT is ERC721URIStorage, Ownable {
    IEDNARegistry public registry;
    uint256 public nextTokenId;
    uint256 public minQualityScore;

    mapping(string => uint256) public analysisToTokenId;

    event RegistryUpdated(address indexed oldRegistry, address indexed newRegistry);
    event MinQualityUpdated(uint256 oldMinQuality, uint256 newMinQuality);
    event EDNAMinted(
        uint256 indexed tokenId,
        string indexed analysisId,
        address indexed contributor,
        uint256 qualityScore,
        string tokenURI
    );

    constructor(address registryAddress, uint256 minQuality, address initialOwner)
        ERC721("EDNA Verified Analysis", "EDNA")
        Ownable(initialOwner)
    {
        require(registryAddress != address(0), "invalid registry");
        registry = IEDNARegistry(registryAddress);
        minQualityScore = minQuality;
    }

    function setRegistry(address newRegistry) external onlyOwner {
        require(newRegistry != address(0), "invalid registry");
        address old = address(registry);
        registry = IEDNARegistry(newRegistry);
        emit RegistryUpdated(old, newRegistry);
    }

    function setMinQualityScore(uint256 newMinQuality) external onlyOwner {
        require(newMinQuality <= 100, "quality out of range");
        uint256 old = minQualityScore;
        minQualityScore = newMinQuality;
        emit MinQualityUpdated(old, newMinQuality);
    }

    function mintFromAnalysis(string calldata analysisId, string calldata tokenURI_) external returns (uint256 tokenId) {
        IEDNARegistry.AnalysisRecord memory rec = registry.getRecord(analysisId);

        require(rec.oracleVerified, "analysis not oracle-verified");
        require(!rec.minted, "analysis already minted");
        require(rec.qualityScore >= minQualityScore, "quality below threshold");
        require(msg.sender == rec.contributor || msg.sender == owner(), "not authorized");

        tokenId = ++nextTokenId;
        _safeMint(rec.contributor, tokenId);

        if (bytes(tokenURI_).length > 0) {
            _setTokenURI(tokenId, tokenURI_);
        } else {
            _setTokenURI(tokenId, rec.metadataURI);
        }

        analysisToTokenId[analysisId] = tokenId;
        registry.markMinted(analysisId, tokenId);

        emit EDNAMinted(tokenId, analysisId, rec.contributor, rec.qualityScore, tokenURI(tokenId));
    }
}
