const Irys = require('@irys/sdk');
require('dotenv').config();

async function estimateCost() {
  const privateKey = process.env.ATTESTER_KEY;
  const rpcUrl = process.env.BASE_RPC_URL || 'https://mainnet.base.org';

  if (!privateKey) {
    console.error('ATTESTER_KEY not found');
    return;
  }

  const irys = new Irys({
    url: 'https://node2.irys.xyz',
    token: 'base-eth',
    key: privateKey,
    config: { providerUrl: rpcUrl }
  });

  try {
    // Estimate for 1MB of data (way more than needed for a single backfill)
    const bytes = 1024 * 1024; 
    const price = await irys.getPrice(bytes);
    const balance = await irys.getLoadedBalance();

    console.log(`--- Irys Cost Estimation ---`);
    console.log(`Current Wallet Address: ${irys.address}`);
    console.log(`Current Balance: ${irys.utils.fromAtomic(balance)} ETH`);
    console.log(`Cost for 1MB of data: ${irys.utils.fromAtomic(price)} ETH`);
    console.log(`----------------------------`);
    
    // Total historical records is ~200. Let's say 200KB total.
    const backfillBytes = 200 * 1024;
    const backfillPrice = await irys.getPrice(backfillBytes);
    console.log(`Estimated cost for 200KB backfill: ${irys.utils.fromAtomic(backfillPrice)} ETH`);
    
  } catch (error) {
    console.error('Error estimating cost:', error.message);
  }
}

estimateCost();
