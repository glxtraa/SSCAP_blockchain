# VWB Ecosystem: Admin & Architect Guide

This guide provides the technical specifications and step-by-step instructions required to recreate the VWB blockchain infrastructure from scratch.

## 🏗️ Data Architecture: The Dual-Tier Model

The system uses a **decoupled, two-tier anchoring strategy** to balance cost-efficiency with high-frequency auditability.

### Tier 1: Daily Raw Data Anchors
- **Purpose**: Permanent storage of high-frequency sensor readings.
- **Protocol**: Irys (Arweave) + EAS (Base L2).
- **Schema**: `string date, string arweaveUrl, uint256 recordCount`
- **Data Model**:
  ```json
  [
    {
      "filename": "sscap/nivel/...",
      "uploadedAt": "2026-03-27T14:30:50Z",
      "content": {
        "data": { "tlaloque_id": "test-3", "meters": 1.2 },
        "metadata": { "origin": "sscap-api" }
      }
    }
  ]
  ```

### Tier 2: Quarterly VWB Summary
- **Purpose**: Aggregate proof for VWB token minting.
- **Protocol**: EAS (Base L2).
- **Schema**: `string basin, string quarter, uint256 totalLiters, string computationProofsUrl`

---

## 🛠️ Step-by-Step Setup

### Step 1: Wallet Infrastructure
1. Create a fresh EVM wallet (MetaMask or Ledger).
2. Fund it with **Base Mainnet ETH** (~$15 USD is more than enough for a year).
3. Export the Private Key (this becomes your `ATTESTER_KEY`).

### Step 2: EAS Schema Registration
Go to [EAS Scan (Base Mainnet)](https://base.easscan.org/) and register the two schemas:

1. **Daily Anchor Schema**:
   - **Fields**: `string date, string arweaveUrl, uint256 recordCount`
   - **Resolver**: `0x0000000000000000000000000000000000000000` (None)
   - **Revocable**: No

2. **VWB Summary Schema**:
   - **Fields**: `string basin, string quarter, uint256 totalLiters, string computationProofsUrl`
   - **Resolver**: `0x0000000000000000000000000000000000000000` (None)
   - **Revocable**: No

### Step 3: Arweave/Irys Integration
The system uses **Irys** to bridge Base ETH payments to Arweave storage. 
- No separate Arweave wallet is needed. 
- The storage is **permanent** and **censorship-resistant**.
- Data is accessible via the Irys gateway: `https://gateway.irys.xyz/[TX_ID]`.

### Step 4: Vercel Deployment
1. Cloned the repository.
2. Push to Vercel.
3. Configure the following **Environment Variables**:
   - `ATTESTER_KEY`: Private Key.
   - `ATTESTER_ADDRESS`: Wallet Address.
   - `EAS_TIER1_ANCHOR_SCHEMA_UID`: From Step 2.1.
   - `EAS_TIER2_VWB_SCHEMA_UID`: From Step 2.2.
   - `ADMIN_PASSWORD`: For the dashboard.
   - `VWB_CONTRACT_ADDRESS`: The deployed ERC-20 address.

---

## 🛡️ Security Best Practices
- **Isolation**: Never use the `ATTESTER_KEY` wallet for personal transactions.
- **Password**: The Vercel Admin Dashboard password should be at least 16 characters.
- **Transparency**: Regularly run the **Auditor's Notebook** to confirm that the blockchain records match your local database.
