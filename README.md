# Blue Lifeline: SSCAP Blockchain Anchoring

This repository contains the blockchain integration layer for the Blue Lifeline project. It handles the anchoring of sensor data from the SSCAP system to the **Base L2 blockchain** (via EAS) and **Arweave** (via Irys).

## Overview

The system periodically fetches sensor data (active sensors/tlaloque_id) from the SSCAP API, groups it by day and sensor, uploads the raw JSON payload to Arweave for permanent storage, and creates a blockchain attestation on the Ethereum Attestation Service (EAS) to anchor the data with a timestamp and proof of storage.

## 🛠 Installation from Scratch

Follow these steps to set up the system on a new machine or environment.

### 1. Prerequisites
- **Node.js**: Version 18 or higher.
- **npm**: Version 9 or higher.
- **Wallet**: A wallet with **Base ETH** for gas fees and Arweave storage fees.

### 2. Clone and Install
```bash
git clone <repository-url>
cd SSCAP_blockchain
npm install
```

### 3. Environment Configuration
Create a `.env` file from the provided template:
```bash
cp .env.example .env
```
Edit `.env` and fill in the following critical values:
- `SSCAP_API_URL`: URL of the SSCAP data API.
- `ATTESTER_KEY`: Private key of the wallet that will sign attestations.
- `BASE_RPC_URL`: `https://mainnet.base.org` (or a custom provider).
- `EAS_TIER1_ANCHOR_SCHEMA_UID`: The UID of the EAS schema for raw data anchors.
- `EAS_TIER2_VWB_SCHEMA_UID`: The UID of the EAS schema for VWB token calculations.

### 4. Smart Contract Deployment
To deploy the `VWBToken` contract (used for auditability and reconstruction):
```bash
npx hardhat run scripts/deploy-vwb.js --network base
```
After deployment, copy the address into `VWB_CONTRACT_ADDRESS` in your `.env`.

---

## 🚀 Usage

### Daily Anchoring
The primary orchestration script is designed to run daily (e.g., via a CRON job or Vercel Cron):
```bash
node scripts/tier1_orchestrate.js
```

### Historical Backfill
If you need to anchor past data that was missed:
```bash
node scripts/backfill_anchors.js
```

### Monitoring & Maintenance
See the [Operations Guide](./OPERATIONS_GUIDE.md) for detailed instructions on:
- Funding the Irys storage node.
- Checking gas balances.
- Troubleshooting common errors.

## 📄 License
ISC
