// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

contract OracleCoordinator is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;

    enum RequestStatus {
        NONE,
        PENDING,
        FULFILLED,
        FAILED
    }

    struct AnalysisRecord {
        string analysisId;
        uint256 qualityScore;
        bool readyForMint;
        string resultUri;
        bytes rawResponse;
        bytes rawError;
        RequestStatus status;
        uint256 updatedAt;
    }

    uint64 public subscriptionId;
    bytes32 public donId;
    uint32 public callbackGasLimit;
    uint256 public mintingThreshold;

    string public sourceCode;
    bytes public secretsReference;

    mapping(bytes32 => string) public requestIdToAnalysisId;
    mapping(string => bytes32) public analysisIdToRequestId;
    mapping(string => AnalysisRecord) private analyses;

    event FunctionsConfigUpdated(uint64 subscriptionId, bytes32 donId, uint32 callbackGasLimit);
    event MintingThresholdUpdated(uint256 newThreshold);
    event SourceCodeUpdated();
    event SecretsReferenceUpdated();

    event AnalysisRequested(
        bytes32 indexed requestId,
        string indexed analysisId,
        string sequenceHash,
        address indexed requester
    );

    event AnalysisFulfilled(
        bytes32 indexed requestId,
        string indexed analysisId,
        uint256 qualityScore,
        bool readyForMint,
        string resultUri,
        bytes rawResponse,
        bytes rawError
    );

    constructor(
        address router,
        uint64 _subscriptionId,
        bytes32 _donId,
        uint32 _callbackGasLimit,
        uint256 _mintingThreshold
    ) FunctionsClient(router) ConfirmedOwner(msg.sender) {
        subscriptionId = _subscriptionId;
        donId = _donId;
        callbackGasLimit = _callbackGasLimit;
        mintingThreshold = _mintingThreshold;
    }

    function setFunctionsConfig(
        uint64 _subscriptionId,
        bytes32 _donId,
        uint32 _callbackGasLimit
    ) external onlyOwner {
        subscriptionId = _subscriptionId;
        donId = _donId;
        callbackGasLimit = _callbackGasLimit;
        emit FunctionsConfigUpdated(_subscriptionId, _donId, _callbackGasLimit);
    }

    function setMintingThreshold(uint256 newThreshold) external onlyOwner {
        require(newThreshold <= 100, "Threshold too high");
        mintingThreshold = newThreshold;
        emit MintingThresholdUpdated(newThreshold);
    }

    function setSourceCode(string calldata _sourceCode) external onlyOwner {
        sourceCode = _sourceCode;
        emit SourceCodeUpdated();
    }

    function setSecretsReference(bytes calldata _secretsReference) external onlyOwner {
        secretsReference = _secretsReference;
        emit SecretsReferenceUpdated();
    }

    function requestAnalysis(
        string calldata analysisId,
        string calldata sequenceHash,
        string calldata geneName,
        string calldata contributorAddress
    ) external returns (bytes32 requestId) {
        require(bytes(sourceCode).length > 0, "Source code not configured");
        require(bytes(analysisId).length > 0, "analysisId required");
        require(analysisIdToRequestId[analysisId] == bytes32(0), "analysisId already requested");

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(sourceCode);

        if (secretsReference.length > 0) {
            req.addSecretsReference(secretsReference);
        }

        string[] memory args = new string[](4);
        args[0] = analysisId;
        args[1] = sequenceHash;
        args[2] = geneName;
        args[3] = contributorAddress;
        req.setArgs(args);

        requestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            callbackGasLimit,
            donId
        );

        requestIdToAnalysisId[requestId] = analysisId;
        analysisIdToRequestId[analysisId] = requestId;

        AnalysisRecord storage record = analyses[analysisId];
        record.analysisId = analysisId;
        record.status = RequestStatus.PENDING;
        record.updatedAt = block.timestamp;

        emit AnalysisRequested(requestId, analysisId, sequenceHash, msg.sender);
    }

    function getAnalysis(string calldata analysisId) external view returns (AnalysisRecord memory) {
        return analyses[analysisId];
    }

    function isReadyForMint(string calldata analysisId) external view returns (bool) {
        AnalysisRecord memory record = analyses[analysisId];
        return record.status == RequestStatus.FULFILLED && record.readyForMint;
    }

    function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
        string memory analysisId = requestIdToAnalysisId[requestId];
        require(bytes(analysisId).length > 0, "Unknown requestId");

        AnalysisRecord storage record = analyses[analysisId];
        record.rawResponse = response;
        record.rawError = err;
        record.updatedAt = block.timestamp;

        if (err.length > 0 || response.length == 0) {
            record.status = RequestStatus.FAILED;
            emit AnalysisFulfilled(requestId, analysisId, 0, false, "", response, err);
            return;
        }

        (uint256 qualityScore, string memory resultUri) = abi.decode(response, (uint256, string));

        record.qualityScore = qualityScore;
        record.resultUri = resultUri;
        record.readyForMint = qualityScore >= mintingThreshold;
        record.status = RequestStatus.FULFILLED;

        emit AnalysisFulfilled(
            requestId,
            analysisId,
            qualityScore,
            record.readyForMint,
            resultUri,
            response,
            err
        );
    }
}
