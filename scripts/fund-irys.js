const Irys = require('@irys/sdk');
require('dotenv').config();

/**
 * Utility script to fund the Irys node from the Base L2 wallet.
 * Usage: node scripts/fund-irys.js <amount_in_eth>
 * Example: node scripts/fund-irys.js 0.001
 */
async function fundIrys() {
  const amountStr = process.argv[2];
  if (!amountStr) {
    console.error('Usage: node scripts/fund-irys.js <amount_in_eth>');
    console.error('Example: node scripts/fund-irys.js 0.0005');
    process.exit(1);
  }

  const amountEth = parseFloat(amountStr);
  const privateKey = process.env.ATTESTER_KEY;
  const rpcUrl = process.env.BASE_RPC_URL || 'https://mainnet.base.org';

  if (!privateKey) {
    console.error('Error: ATTESTER_KEY not found in .env');
    process.exit(1);
  }

  const irys = new Irys({
    url: 'https://node2.irys.xyz',
    token: 'base-eth',
    key: privateKey,
    config: { providerUrl: rpcUrl }
  });

  try {
    console.log(`--- Irys Funding Utility ---`);
    console.log(`Wallet Address: ${irys.address}`);
    console.log(`Target Node: https://node2.irys.xyz`);
    console.log(`Funding Amount: ${amountEth} ETH`);
    
    console.log('\nInitiating funding transaction...');
    const fundTx = await irys.fund(irys.utils.toAtomic(amountEth));
    
    console.log('\nSuccess! Transaction details:');
    console.log(`ID: ${fundTx.id}`);
    console.log(`Quantity: ${irys.utils.fromAtomic(fundTx.quantity)} ETH`);
    console.log(`\nYour Irys balance will be updated once the transaction is confirmed on Base.`);
    
  } catch (error) {
    console.error('\nFunding failed:', error.message);
    process.exit(1);
  }
}

fundIrys();
