# Project Memory: VWB Blockchain Integration

**Date**: March 2026  
**Status**: Implementation Complete & Verified on Mainnet

## 🎯 Objective
To create a standalone, auditable pipeline for anchoring SSCAP sensor data and minting VWB tokens on the Base network, without modifying the existing SSCAP Vercel API.

## 🏗️ Architectural Decisions

1. **Standalone Service**: Built as a decoupled Next.js/Node.js application.
2. **Base L2 Choice**: Selected for low transaction fees ($0.01 per anchor) and security.
3. **Dual-Tier Storage**:
   - High-freq data -> Arweave (Permanent storage).
   - Metadata Anchors -> EAS (Blockchain attestation).
   - This ensures 100% auditability while keeping on-chain costs minimal.
4. **Deduplication**: Implemented a "Client-Side Deduplication" logic using SSCAP UUID filenames. This handles overlapping backfills without database complexity.

## 📦 Key Components Implemented

| Component | Description |
| :--- | :--- |
| **Pipeline Scripts** | `tier1_orchestrate.js`, `arweave-uploader.js`, `eas-anchorer.js`. |
| **Historical Backfill** | `backfill_anchors.js` (Anchored data from Mar 20, 26, 27). |
| **VWB Oracle** | `vwb-calculator.js` (Pulses/Meters to Liters + Basin Aggregation). |
| **Smart Contract** | `VWBToken.sol` (ERC-20 with EAS multi-proof verification). |
| **Admin Dashboard** | `/app/admin` (Password-protected manual controls). |
| **Auditor's Notebook** | `VWB_Data_Reconstruction.ipynb` (Colab data recovery tool). |

## 🔗 Live Implementation Details

- **Official Wallet**: `0x44622c7da931c65163f9605AdBADB07ea94C62d4`
- **Tier 1 Schema**: `0xcb00453bf5b719dca06f811d86dc6cca8dd2c660043cd553c686fbbee522af72`
- **Tier 2 Schema**: `0xab88b0e3d38416e68dcc636a0f8891da486e3861b064a8b5659fdd7d616ec7f7`
- **VWB Token Contract**: `0x51b0Df5a5eB30ba7f3620098CCc74A06Bf538ffc`

## 💡 Lessons Learned & Fixes
- **Schema Typo**: Discovered `arwevaeUrl` typo during backfill; fixed in source and made the Reconstruction Notebook backward compatible.
- **Nonce Management**: Added 5-second delays in backfill scripts to prevent `NONCE_TOO_LOW` errors on Base Mainnet.
- **Deduplication**: The unique `filename` is the ultimate source of truth for avoiding double-counting in VWB tokens.
