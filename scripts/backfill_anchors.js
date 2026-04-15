const { downloadData } = require('./data-downloader');
const { uploadToArweave } = require('./arweave-uploader');
const { anchorToEAS } = require('./eas-anchorer');
const { getAnchoredDates } = require('./eas-query');
require('dotenv').config();

async function runBackfill() {
  console.log('--- Starting Historical Backfill ---');
  
  try {
    // 1. Download ALL data (we'll ignore the 24h filter in downloader for this script)
    // Actually, I'll just use a local filter here.
    const axios = require('axios');
    const apiUrl = process.env.SSCAP_API_URL || 'http://localhost:3001';
    const response = await axios.get(`${apiUrl}/api/download`);
    const allRecords = response.data.data;

    console.log(`Processing ${allRecords.length} total historical records.`);

    // 2. Group by day
    const groups = {};
    allRecords.forEach(record => {
      const date = (record.content.created_at || record.uploadedAt).split('T')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(record);
    });

    const dates = Object.keys(groups).sort();
    const anchoredDates = await getAnchoredDates();
    const today = new Date().toISOString().split('T')[0];

    console.log(`Found data for ${dates.length} distinct days: ${dates.join(', ')}`);

    // 3. Process each day
    for (const date of dates) {
      // Deduplication Logic: Skip if historical (date < today) AND already anchored
      if (date < today && anchoredDates.has(date)) {
        console.log(`\n--- Skipping Day: ${date} (Already Anchored) ---`);
        continue;
      }

      console.log(`\n--- Anchoring Day: ${date} (${groups[date].length} records) ---`);
      
      const arweaveUrl = await uploadToArweave(groups[date]);
      const attestationUID = await anchorToEAS(date, arweaveUrl, groups[date].length);
      
      console.log(`Done for ${date}: UID=${attestationUID}`);
      // Wait to prevent nonce conflicts
      await new Promise(r => setTimeout(r, 5000));
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
