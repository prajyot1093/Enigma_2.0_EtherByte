/**
 * LandRegistry Smart Contract Configuration
 *
 * ─────────────────────────────────────────────────────────────
 * HOW TO FILL THIS FILE:
 *  1. Open Remix IDE  →  https://remix.ethereum.org
 *  2. Create a new file named LandRegistry.sol and paste the
 *     contract from  contracts/LandRegistry.sol  in this repo.
 *  3. Compile with Solidity 0.8.20 (Compiler tab).
 *  4. Deploy to Sepolia testnet via Injected Provider (MetaMask).
 *  5. Copy the deployed contract address from Remix and paste below.
 *  6. In the Remix Compiler tab → ABI button → copy JSON and
 *     paste it into the CONTRACT_ABI array below.
 * ─────────────────────────────────────────────────────────────
 */

/** Deployed contract address on Sepolia */
export const CONTRACT_ADDRESS = "0x2fa1F17E046B1C38b89052A60d72F68D6d9d796A" as const;

/** Chain ID for Sepolia testnet */
export const CHAIN_ID = 11155111;

/** ABI — from Remix deployment */
export const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "internalType": "address", "name": "previousOwner", "type": "address" },
      { "indexed": true,  "internalType": "address", "name": "newOwner",      "type": "address" }
    ],
    "name": "AdminTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "internalType": "string",  "name": "landId",           "type": "string"  },
      { "indexed": true,  "internalType": "bytes32", "name": "ownerAadhaarHash", "type": "bytes32" },
      { "indexed": true,  "internalType": "address", "name": "registeredBy",     "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp",        "type": "uint256" }
    ],
    "name": "LandRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "internalType": "string",  "name": "landId",          "type": "string"  },
      { "indexed": true,  "internalType": "bytes32", "name": "fromAadhaarHash", "type": "bytes32" },
      { "indexed": true,  "internalType": "bytes32", "name": "toAadhaarHash",   "type": "bytes32" },
      { "indexed": false, "internalType": "address", "name": "transferredBy",   "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp",       "type": "uint256" }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "string",  "name": "landId",           "type": "string"  },
      { "internalType": "bytes32", "name": "ownerAadhaarHash", "type": "bytes32" }
    ],
    "name": "registerLand",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "newOwner", "type": "address" }
    ],
    "name": "transferAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string",  "name": "landId",              "type": "string"  },
      { "internalType": "bytes32", "name": "newOwnerAadhaarHash", "type": "bytes32" }
    ],
    "name": "transferLandOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "landId", "type": "string" }
    ],
    "name": "getCurrentOwner",
    "outputs": [
      { "internalType": "bytes32", "name": "", "type": "bytes32" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "landId", "type": "string" }
    ],
    "name": "getLandRecord",
    "outputs": [
      {
        "components": [
          { "internalType": "string",  "name": "landId",           "type": "string"  },
          { "internalType": "bytes32", "name": "ownerAadhaarHash", "type": "bytes32" },
          { "internalType": "address", "name": "registeredBy",     "type": "address" },
          { "internalType": "uint256", "name": "registeredAt",     "type": "uint256" },
          { "internalType": "bool",    "name": "exists",           "type": "bool"    }
        ],
        "internalType": "struct LandRegistry.LandRecord",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "landId", "type": "string" }
    ],
    "name": "getTransferCount",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "landId", "type": "string" }
    ],
    "name": "getTransferHistory",
    "outputs": [
      {
        "components": [
          { "internalType": "bytes32", "name": "fromAadhaarHash", "type": "bytes32" },
          { "internalType": "bytes32", "name": "toAadhaarHash",   "type": "bytes32" },
          { "internalType": "address", "name": "transferredBy",   "type": "address" },
          { "internalType": "uint256", "name": "transferredAt",   "type": "uint256" }
        ],
        "internalType": "struct LandRegistry.TransferEntry[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "landId", "type": "string" }
    ],
    "name": "isLandRegistered",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
