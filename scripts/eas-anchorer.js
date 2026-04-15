const { EAS, SchemaEncoder } = require('@ethereum-attestation-service/eas-sdk');
const { ethers } = require('ethers');
require('dotenv').config();

const EAS_CONTRACT_ADDRESS = '0x4200000000000000000000000000000000000021';

async function anchorToEAS(date, arweaveUrl, recordCount) {
  const privateKey = process.env.ATTESTER_KEY;
  const rpcUrl = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
  const schemaUID = process.env.EAS_TIER1_ANCHOR_SCHEMA_UID;

  if (!privateKey || !schemaUID) {
    throw new Error('ATTESTER_KEY or EAS_TIER1_ANCHOR_SCHEMA_UID not found');
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);
  const eas = new EAS(EAS_CONTRACT_ADDRESS);
  eas.connect(signer);

  const schemaEncoder = new SchemaEncoder('string date, string arweaveUrl, uint256 recordCount');
  const encodedData = schemaEncoder.encodeData([
    { name: 'date', value: date, type: 'string' },
    { name: 'arweaveUrl', value: arweaveUrl, type: 'string' },
    { name: 'recordCount', value: recordCount, type: 'uint256' }
  ]);

  console.log(`Creating EAS attestation for ${date}...`);

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
    console.log(`Attestation successful! UID: ${newAttestationUID}`);
    return newAttestationUID;
  } catch (error) {
    console.error('Error creating EAS attestation:', error.message);
    throw error;
  }
}

module.exports = { anchorToEAS };
