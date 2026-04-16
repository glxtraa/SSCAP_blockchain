# Operations Guide: Data Anchoring & Backfilling

This guide explains how to manage the data anchoring process, including daily operations and historical backfills to Arweave and the Base blockchain.

---

## 📋 Prerequisites

### 1. Node.js Environment
The scripts require Node.js. If you have `nvm` installed, ensure you are using a compatible version (v20+):
```bash
nvm install 20
nvm use 20
```

### 2. Environment Variables (`.env`)
Ensure your `.env` file is configured. See the **Environment Key Reference** at the bottom of this guide for details on how to acquire each key.

---

## 🏃 1. Running the Daily Anchor (Daily Fill)

The **Daily Anchor** (Tier 1) downloads the last 24 hours of sensor data, uploads it to Arweave, and creates a blockchain attestation on Base.

### Manual CLI Execution
To trigger the daily anchor manually from your terminal:
```bash
node scripts/tier1_orchestrate.js
```

### Automated Execution (Vercel)
If deployed on Vercel, the daily anchor is exposed as an API route:
- **Endpoint**: `POST /api/admin/daily-anchor`
- **Auth**: Requires `Authorization: Bearer [ADMIN_PASSWORD]` header.
- **Trigger**: You can schedule this using a Cron service (like GitHub Actions or Vercel Cron).

---

## ⏪ 2. Running the Historical Backfill

The **Backfill** script is used to process all historical data in the SSCAP API that hasn't been anchored yet.

### How it Works
1. Fetches **all** historical records from the API.
2. Groups them by **distinct calendar days**.
3. **Deduplication Logic**: Before processing, it queries the blockchain. 
   - If a historical day (`date < today`) is already anchored, it **skips** it automatically.
   - If the day is **today**, it will **re-anchor** it to ensure the latest measurements are included.

### Manual CLI Execution
To run the backfill from scratch (this will only process missing days):
```bash
node scripts/backfill_anchors.js
```

### Expected Output
- **Skipping messages**: For days that are already on-chain.
- **Anchoring messages**: For new days, showing the Arweave URL and EAS UID.

---

## 🛠️ Troubleshooting

### "Node not found"
If your environment doesn't recognize the `node` command, you may need to specify the absolute path.
- **Find path**: `which node` (or check `~/.nvm/versions/node/.../bin/node`)
- **Run with path**: `/path/to/node scripts/backfill_anchors.js`

### Wallet Funding
Each anchor consumes a tiny amount of ETH on Base (~$0.01 - $0.05). If the script fails with "insufficient funds", please add a small amount of ETH to your `ATTESTER_ADDRESS`.

### Indexer Latency
EAS Scan (the indexer) usually has a delay of 5-10 seconds. If you run a script twice in very rapid succession, the deduplication logic might not see the very first transaction yet.

---

## 🔑 Environment Key Reference

| Key | Where to get it | Notes |
| :--- | :--- | :--- |
| `SSCAP_API_URL` | Your Vercel Dashboard | The Root URL of your separate SSCAP API deployment. |
| `BASE_RPC_URL` | Public or Alchemy | Default: `https://mainnet.base.org`. For high reliability, use an Alchemy or QuickNode endpoint. |
| `ATTESTER_KEY` | MetaMask / Wallet | Export the **Private Key** (not seed phrase) from your dedicated attester wallet. |
| `ATTESTER_ADDRESS` | MetaMask / Wallet | The public address associated with the key above. Used for deduplication checks. |
| `EAS_TIER1_ANCHOR_SCHEMA_UID` | [EAS Base Scan](https://base.easscan.org/) | UID of the registered schema: `string date, string arweaveUrl, uint256 recordCount`. |
| `EAS_TIER2_VWB_SCHEMA_UID` | [EAS Base Scan](https://base.easscan.org/) | UID of the registered schema: `string basin, string quarter, uint256 totalLiters, string computationProofsUrl`. |
| `VWB_CONTRACT_ADDRESS` | Terminal Output | The address of your deployed VWB Token contract (output after running `scripts/deploy-vwb.js`). |
| `ADMIN_PASSWORD` | Manual | Choose a secure password (minimum 16 chars) to protect the admin routes and dashboard. |

---

## ⛽ Gas Budgeting & Management

The system operates on **Base (Layer 2)**, making it extremely cost-effective. However, the attester wallet must maintain a small balance.

### Estimating Costs
- **Daily Anchor (Tier 1)**: Each attestation costs roughly $0.01 - $0.05 USD (in Base ETH) depending on network congestion.
- **Yearly estimate**: ~$15 - $20 USD for 365 daily anchors.
- **Backfill**: 16 years of historical days would cost roughly $0.50 - $1.00 total.

### Recommended Funding Plan
1. **Initial Fund**: To avoid maintenance, fund the `ATTESTER_ADDRESS` with **0.01 ETH to 0.05 ETH** (roughly $30 - $150 USD). 
2. **Monitoring**: Periodically check the wallet balance at [basescan.org](https://basescan.org).
3. **Wallet Safety**: **Never** use this wallet for anything else. Keep the private key strictly inside your `.env` and never share it or commit it to GitHub.

### 🛡️ Automatic Gas Monitor
The scripts now include a built-in safety guard to prevent transaction failures:
- **Warning (< 0.002 ETH)**: Logs a notice but continues execution.
- **Critical (< 0.0002 ETH)**: **Aborts execution** immediately to protect against botched on-chain records.
