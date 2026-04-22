const { downloadData } = require('./data-downloader');
const { uploadToArweave } = require('./arweave-uploader');
const { anchorToEAS } = require('./eas-anchorer');
const { getAnchoredDates } = require('./eas-query');
const { checkGas } = require('./gas-monitor');
require('dotenv').config();
process.env.TZ = 'UTC';

async function runBackfill() {
  console.log('--- Starting Historical Backfill ---');
  
  try {
    // 0. Check Gas
    await checkGas();

    // 1. Download ALL data...
    // Actually, I'll just use a local filter here.
    const axios = require('axios');
    const apiUrl = process.env.SSCAP_API_URL || 'http://localhost:3001';
    const response = await axios.get(`${apiUrl}/api/download`);
    const allRecords = response.data.data;

    console.log(`Processing ${allRecords.length} total historical records.`);

    // 2. Group by day AND tlaloque_id
    const groups = {};
    allRecords.forEach(record => {
      const date = (record.content.created_at || record.uploadedAt).split('T')[0];
      const tid = record.content.data.tlaloque_id || 'unknown';
      
      if (!groups[date]) groups[date] = {};
      if (!groups[date][tid]) groups[date][tid] = [];
      groups[date][tid].push(record);
    });

    const dates = Object.keys(groups).sort();
    const anchoredDates = await getAnchoredDates();
    const today = new Date().toISOString().split('T')[0];

    console.log(`Found data for ${dates.length} distinct days: ${dates.join(', ')}`);

    // 3. Process each day
    for (const date of dates) {
      const sensorGroups = groups[date];
      const tids = Object.keys(sensorGroups);

      // Deduplication & Safety Logic:
      // 1. Skip if it's the current day (it's not finished yet)
      if (date === today) {
        console.log(`\n--- Skipping Today: ${date} (Waiting for day to finalize) ---`);
        continue;
      }

      const anchorCount = anchoredDates[date] || 0;
      const yesterday = new Date(new Date(today).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      if (date < today && anchorCount > 1) {
        console.log(`\n--- Skipping Day: ${date} (Already anchored per-sensor: ${anchorCount} anchors) ---`);
        continue;
      }

      if (date < yesterday && anchorCount === 1) {
        console.log(`\n--- Skipping Day: ${date} (Already has aggregate anchor) ---`);
        continue;
      }

      console.log(`\n--- Processing Day: ${date} (${tids.length} sensors) ---`);
      
      for (const tid of tids) {
        const sensorRecords = sensorGroups[tid];
        console.log(`  Anchoring Sensor: ${tid} (${sensorRecords.length} records)`);
        
        const arweaveUrl = await uploadToArweave(sensorRecords);
        const attestationUID = await anchorToEAS(date, arweaveUrl, sensorRecords.length);
        
        console.log(`  Done for ${tid}: UID=${attestationUID}`);
        // Wait to prevent nonce conflicts
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    console.log('\n--- Backfill Completed Successfully ---');
  } catch (error) {
    console.error('Backfill Failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  runBackfill();
}
