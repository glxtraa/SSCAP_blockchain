const { downloadData } = require('./data-downloader');
const { uploadToArweave } = require('./arweave-uploader');
const { anchorToEAS } = require('./eas-anchorer');
const { getAnchoredDates } = require('./eas-query');
const { checkGas } = require('./gas-monitor');
require('dotenv').config();
process.env.TZ = 'UTC';

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

    const date = new Date().toISOString().split('T')[0];
    
    // Group records by tlaloque_id
    const groups = {};
    records.forEach(record => {
      const tid = record.content.data.tlaloque_id || 'unknown';
      if (!groups[tid]) groups[tid] = [];
      groups[tid].push(record);
    });

    const tids = Object.keys(groups);
    console.log(`Grouping complete. Found ${tids.length} active sensors today.`);

    const results = [];
    const anchoredDates = await getAnchoredDates();

    for (const tid of tids) {
      console.log(`\nProcessing Sensor: ${tid} (${groups[tid].length} records)`);
      
      const arweaveUrl = await uploadToArweave(groups[tid]);
      
      if (anchoredDates[date]) {
        console.log(`[Note] ${date} already has ${anchoredDates[date]} anchor(s). Adding new attestation for sensor ${tid}.`);
      }

      const attestationUID = await anchorToEAS(date, arweaveUrl, groups[tid].length);
      results.push({ tid, attestationUID, arweaveUrl });
      
      // Small pause to prevent nonce collisions
      await new Promise(r => setTimeout(r, 2000));
    }

    console.log('\n--- Tier 1 Completed Successfully ---');
    console.log(`Processed ${results.length} sensors.`);
    
    return results;
  } catch (error) {
    console.error('Tier 1 Failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  runTier1();
}

module.exports = { runTier1 };
