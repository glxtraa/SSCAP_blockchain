# EAS Schema Registration Guide

To anchor data on Base, you must first register the schemas that define the structure of your attestations. 

## Registration Steps (Base Mainnet)

1.  **Connect Wallet**: Go to [base.easscan.org](https://base.easscan.org/) and connect your MetaMask (ensure you are on the **Base Mainnet** and have a few cents of ETH).
2.  **Navigate to Schemas**: Click on the **"Schemas"** tab in the top navigation bar, then click **"Register Schema"**.
3.  **Enter Schema Details**: Copy and paste the strings below exactly as shown.

---

### Schema 1: Daily Raw Data Anchor (Tier 1)
This schema stores the link to the daily Arweave bundle.

-   **Schema String**: `string date, string arweaveUrl, uint256 recordCount`
-   **Revocable**: Unchecked (Keep it **non-revocable** for maximum auditability).

### Schema 2: VWB Quarterly Summary (Tier 2)
This schema stores the calculated water benefit result.

-   **Schema String**: `string basin, string quarter, uint256 totalLiters, string computationProofsUrl`
-   **Revocable**: Unchecked.

---

## After Registration

1.  Once you click **"Register"** and confirm the transaction (cost: ~$0.05), you will be taken to the Schema page.
2.  Look for the **"UID"** (a long 32-byte hash starting with `0x...`).
3.  Copy these UIDs into your `.env` file:
    -   `EAS_TIER1_ANCHOR_SCHEMA_UID`
    -   `EAS_TIER2_VWB_SCHEMA_UID`

## Why No "Resolver"?
In these schemas, we are skipping the "Resolver Contract" field. This keeps things simple and cheap. Our smart contract will manually verify the attestations later.
