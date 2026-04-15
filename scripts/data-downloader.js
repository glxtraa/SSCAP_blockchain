const axios = require('axios');
require('dotenv').config();

async function downloadData() {
  const apiUrl = process.env.SSCAP_API_URL || 'http://localhost:3001';
  const downloadEndpoint = `${apiUrl}/api/download`;

  console.log(`Fetching data from: ${downloadEndpoint}`);

  try {
    const response = await axios.get(downloadEndpoint);
    const allRecords = response.data.data;

    console.log(`Received ${allRecords.length} total records.`);

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const newRecords = allRecords.filter(record => {
      const recordDate = new Date(record.content.created_at || record.uploadedAt);
      return recordDate >= twentyFourHoursAgo;
    });

    console.log(`Filtered ${newRecords.length} records from the last 24 hours.`);
    return newRecords;
  } catch (error) {
    console.error('Error downloading data:', error.message);
    throw error;
  }
}

if (require.main === module) {
  downloadData().then(records => {
    console.log('Success!');
  }).catch(err => {
    process.exit(1);
  });
}

module.exports = { downloadData };
