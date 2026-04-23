const { ethers } = require('ethers');
const Irys = require('@irys/sdk');
require('dotenv').config();

// Thresholds in ETH
const WARNING_THRESHOLD = 0.002;
const CRITICAL_THRESHOLD = 0.0002;

const IRYS_WARNING_THRESHOLD = 0.0001;

/**
 * Checks the ETH balance of the attester wallet on Base 
 * AND the Irys node balance for Arweave storage.
 */
async function checkGas() {
  const rpcUrl = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
  const address = process.env.ATTESTER_ADDRESS;
  const privateKey = process.env.ATTESTER_KEY;

  if (!address) {
    console.warn('[Gas Monitor] ATTESTER_ADDRESS not found. Skipping gas check.');
    return;
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);

  try {
    // 1. Check Base L2 Balance (Gas)
    const balanceWei = await provider.getBalance(address);
    const balanceEth = parseFloat(ethers.formatEther(balanceWei));

    console.log(`[Gas Monitor] Base L2 Balance: ${balanceEth.toFixed(6)} ETH`);

    if (balanceEth < CRITICAL_THRESHOLD) {
      console.error(`\n[CRITICAL ERROR] Base Wallet balance (${balanceEth.toFixed(6)} ETH) is below the safety threshold (${CRITICAL_THRESHOLD} ETH).`);
      console.error(`Please fund the attester wallet immediately: ${address}\n`);
      throw new Error('Insufficient gas for blockchain operations.');
    }

    if (balanceEth < WARNING_THRESHOLD) {
      console.warn(`\n[WARNING] Base Wallet balance is low (${balanceEth.toFixed(6)} ETH).`);
      console.warn(`Please fund the attester wallet soon: ${address}`);
      console.warn(`Consider adding more funds soon to prevent future interruptions.\n`);
    }

    // 2. Check Irys Node Balance (Storage)
    if (privateKey) {
      const irys = new Irys({
        url: 'https://node2.irys.xyz',
        token: 'base-eth',
        key: privateKey,
        config: { providerUrl: rpcUrl }
      });

      const irysBalanceAtomic = await irys.getLoadedBalance();
      const irysBalanceEth = parseFloat(irys.utils.fromAtomic(irysBalanceAtomic));

      console.log(`[Gas Monitor] Irys Node Balance: ${irysBalanceEth.toFixed(6)} ETH`);

      if (irysBalanceEth < IRYS_WARNING_THRESHOLD) {
        console.warn(`\n[WARNING] Irys Node balance is low (${irysBalanceEth.toFixed(6)} ETH).`);
        console.warn(`You must fund the Irys node using 'irys fund' or the fund-irys.js utility.`);
        console.warn(`Storage uploads may fail if this reaches zero.\n`);
      }
    }

  } catch (error) {
    if (error.message.includes('Insufficient gas')) throw error;
    
    console.warn(`\n[Gas Monitor] Could not verify all balances: ${error.message}`);
    console.warn(`Attempting to proceed anyway...\n`);
  }
}

if (require.main === module) {
  checkGas();
}

module.exports = { checkGas };
