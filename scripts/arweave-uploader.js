const Irys = require('@irys/sdk');
require('dotenv').config();

async function uploadToArweave(data) {
  const privateKey = process.env.ATTESTER_KEY;
  const rpcUrl = process.env.BASE_RPC_URL || 'https://mainnet.base.org';

  if (!privateKey) {
    throw new Error('ATTESTER_KEY not found in environment variables');
  }

  const irys = new Irys({
    url: 'https://node2.irys.xyz',
    token: 'base-eth',
    key: privateKey,
    config: { providerUrl: rpcUrl }
  });

  try {
    const jsonString = JSON.stringify(data);
    const size = Buffer.byteLength(jsonString);
    
    console.log(`Uploading ${size} bytes to Arweave via Irys...`);

    const response = await irys.upload(jsonString, {
      tags: [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'App-Name', value: 'SSCAP-VWB-Anchor' },
        { name: 'Timestamp', value: new Date().toISOString() }
      ]
    });

    const url = `https://gateway.irys.xyz/${response.id}`;
    console.log(`Upload successful! URL: ${url}`);
    return url;
  } catch (error) {
    console.error('Error uploading to Irys:', error.message);
    throw error;
  }
}

module.exports = { uploadToArweave };
