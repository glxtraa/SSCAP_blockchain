const { ethers } = require('ethers');
require('dotenv').config();

// Thresholds in ETH
const WARNING_THRESHOLD = 0.002;
const CRITICAL_THRESHOLD = 0.0002;

/**
 * Checks the ETH balance of the attester wallet on Base.
 * Throws an error if balance is below the critical threshold.
 */
async function checkGas() {
  const rpcUrl = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
  const address = process.env.ATTESTER_ADDRESS;

  if (!address) {
    console.warn('[Gas Monitor] ATTESTER_ADDRESS not found. Skipping gas check.');
    return;
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);

  try {
    const balanceWei = await provider.getBalance(address);
    const balanceEth = parseFloat(ethers.formatEther(balanceWei));

    console.log(`[Gas Monitor] Current Balance: ${balanceEth.toFixed(6)} ETH`);

    if (balanceEth < CRITICAL_THRESHOLD) {
      console.error(`\n[CRITICAL ERROR] Wallet balance (${balanceEth.toFixed(6)} ETH) is below the safety threshold (${CRITICAL_THRESHOLD} ETH).`);
      console.error(`Please fund the attester wallet immediately: ${address}\n`);
      throw new Error('Insufficient gas for blockchain operations.');
    }

    if (balanceEth < WARNING_THRESHOLD) {
      console.warn(`\n[WARNING] Wallet balance is low (${balanceEth.toFixed(6)} ETH).`);
      console.warn(`Please fund the attester wallet soon: ${address}`);
      console.warn(`Consider adding more funds soon to prevent future interruptions.\n`);
    }

  } catch (error) {
    if (error.message.includes('Insufficient gas')) throw error;
    
    console.warn(`[Gas Monitor] Could not verify balance: ${error.message}`);
    console.warn(`Attempting to proceed anyway...`);
  }
}

if (require.main === module) {
  checkGas();
}

module.exports = { checkGas };
