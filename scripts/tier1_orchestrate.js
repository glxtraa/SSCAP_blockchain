const { downloadData } = require('./data-downloader');
const { uploadToArweave } = require('./arweave-uploader');
const { anchorToEAS } = require('./eas-anchorer');
const { getAnchoredDates } = require('./eas-query');
const { checkGas } = require('./gas-monitor');
require('dotenv').config();

async function runTier1() {
  console.log('--- Starting Tier 1 Daily Anchoring ---');
  
  try {
    // 0. Check Gas
    await checkGas();

    const records = await downloadData();
    if (records.length === 0) {
      console.log('No new records to anchor today.');
      return;
    }

    const arweaveUrl = await uploadToArweave(records);
    const date = new Date().toISOString().split('T')[0];

    // Deduplication check (Warning only for today)
    const anchoredDates = await getAnchoredDates();
    if (anchoredDates.has(date)) {
      console.log(`[Note] Today (${date}) was already anchored. Proceeding with update to capture new measurements.`);
    }

    const attestationUID = await anchorToEAS(date, arweaveUrl, records.length);

    console.log('--- Tier 1 Completed Successfully ---');
    console.log(`Summary: Date=${date}, Records=${records.length}, Attestation=${attestationUID}`);
    
    return { date, attestationUID, arweaveUrl };
  } catch (error) {
    console.error('Tier 1 Failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  runTier1();
}

module.exports = { runTier1 };
