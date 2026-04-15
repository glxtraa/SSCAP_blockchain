const { aggregateByBasin } = require('./vwb-calculator');
const { EAS, SchemaEncoder } = require('@ethereum-attestation-service/eas-sdk');
const { ethers } = require('ethers');
require('dotenv').config();

const EAS_CONTRACT_ADDRESS = '0x4200000000000000000000000000000000000021';

async function runQuarterlyOracle(basin, quarter, rawRecords) {
  console.log(`--- Running Quarterly Oracle for ${basin} during ${quarter} ---`);
  const aggregation = aggregateByBasin(rawRecords);
  const basinData = aggregation[basin];

  if (!basinData) {
    throw new Error(`No data found for basin: ${basin}`);
  }

  const proofUrl = 'https://arweave.net/placeholder-proof'; 
  return await anchorQuarterlySum(basin, quarter, basinData.totalLiters, proofUrl);
}

async function anchorQuarterlySum(basin, quarter, totalLiters, proofUrl) {
  const privateKey = process.env.ATTESTER_KEY;
  const schemaUID = process.env.EAS_TIER2_VWB_SCHEMA_UID;

  if (!privateKey || !schemaUID) {
    console.warn('Skipping EAS anchoring (Missing Tier 2 UID or Key).');
    return null;
  }

  const rpcUrl = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);
  const eas = new EAS(EAS_CONTRACT_ADDRESS);
  eas.connect(signer);

  const schemaEncoder = new SchemaEncoder('string basin, string quarter, uint256 totalLiters, string computationProofsUrl');
  const encodedData = schemaEncoder.encodeData([
    { name: 'basin', value: basin, type: 'string' },
    { name: 'quarter', value: quarter, type: 'string' },
    { name: 'totalLiters', value: totalLiters, type: 'uint256' },
    { name: 'computationProofsUrl', value: proofUrl, type: 'string' }
  ]);

  try {
    const tx = await eas.attest({
      schema: schemaUID,
      data: {
        recipient: ethers.ZeroAddress,
        expirationTime: 0n,
        revocable: false,
        data: encodedData,
      },
    });

    const newAttestationUID = await tx.wait();
    console.log(`Quarterly summary anchored! UID: ${newAttestationUID}`);
    return newAttestationUID;
  } catch (error) {
    console.error('Error anchoring quarterly sum:', error.message);
    throw error;
  }
}

if (require.main === module) {
  const fs = require('fs');
  const path = require('path');
  const mockData = JSON.parse(fs.readFileSync(path.join(__dirname, '../vwb_blockchain_repo_plan/example_data.json'), 'utf8'));
  
  runQuarterlyOracle('Valle de México', '2026-Q1', mockData.data)
    .then(uid => console.log('Done.'))
    .catch(err => console.error(err));
}

module.exports = { runQuarterlyOracle };
