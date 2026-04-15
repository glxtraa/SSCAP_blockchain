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
Ensure your `.env` file contains the following critical keys:
- `SSCAP_API_URL`: The URL of your Vercel SSCAP API.
- `ATTESTER_KEY`: The private key of the anchoring wallet.
- `EAS_TIER1_ANCHOR_SCHEMA_UID`: The UID for the daily anchor schema.
- `BASE_RPC_URL`: `https://mainnet.base.org` (or a dedicated provider URL).

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
