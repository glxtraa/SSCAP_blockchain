# Operations & Maintenance Guide

This guide ensures the ongoing stability of the Blue Lifeline blockchain anchoring system.

## 1. Daily Monitoring

The system is designed to run automatically, but the logs should be reviewed periodically (or integrated into an alerting system).

### Gas & Storage Check
The `scripts/gas-monitor.js` script runs at the start of every anchoring operation. It reports two critical balances:

1.  **Base L2 Balance**: Used for paying gas fees for EAS attestations.
2.  **Irys Node Balance**: Used for paying Arweave storage fees for raw JSON data.

> [!WARNING]
> While both balances are in ETH, they are separate. Funding the Base wallet does **not** automatically fund the Irys storage node.

---

## 2. Funding Procedures

### Step 1: Fund the Base L2 Wallet
Send **Base ETH** (approximately 0.005 ETH or ~$15 is recommended for months of operation) to the attester address:
`0x44622c7da931c65163f9605AdBADB07ea94C62d4`

### Step 2: Fund the Irys Node
Once the Base wallet is funded, you must transfer a small fraction to the Irys storage service:

```bash
# Fund the Irys node with 0.0005 ETH
node scripts/fund-irys.js 0.0005
```

---

## 3. Operational Policies

### Timezone (UTC)
To prevent data calculation drifts and overlap issues, all scripts explicitly execute in **UTC**.
- **Today** is defined as the current UTC date.
- **Historical Backfills** will skip the current UTC date to ensure the day is fully finalized before anchoring.

### Per-Sensor Granularity
Daily events are grouped by `tlaloque_id`. Each sensor active during the day receives its own:
- Arweave Raw Data Link
- EAS Attestation Event

This allows for future "burn" or "sell" operations on individual sensor data without affecting the rest of the basin analytics.

---

## 4. Troubleshooting

| Error | Meaning | Resolution |
| :--- | :--- | :--- |
| **402 Error** | Insufficient Irys Balance | Run `node scripts/fund-irys.js` to add storage funds. |
| **502 Error** | Irys Node Outage | Wait a few minutes or switch nodes (e.g., node1 to node2) in `arweave-uploader.js`. |
| **Nonce Collision** | Transactions sent too fast | The scripts include a 2-3 second delay. Increase the delay in the loop if this persists. |
| **Insufficient Gas** | Base Wallet empty | Send Base ETH to the attester address. |
