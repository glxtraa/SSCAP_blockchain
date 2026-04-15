const axios = require('axios');
require('dotenv').config();

const EAS_GRAPHQL_ENDPOINT = 'https://base.easscan.org/graphql';

/**
 * Fetches already anchored dates from the EAS Indexer for the Tier 1 schema.
 * @returns {Promise<Set<string>>} A set of dates (YYYY-MM-DD) already anchored on EAS.
 */
async function getAnchoredDates() {
  const schemaUID = process.env.EAS_TIER1_ANCHOR_SCHEMA_UID;
  const attester = process.env.ATTESTER_ADDRESS;

  if (!schemaUID || !attester) {
    console.warn('Missing EAS_TIER1_ANCHOR_SCHEMA_UID or ATTESTER_ADDRESS. Skipping duplicate check.');
    return new Set();
  }

  const query = `
    query Attestations($schema: String!, $attester: String!) {
      attestations(where: {
        schemaId: { equals: $schema },
        attester: { equals: $attester }
      }) {
        decodedDataJson
      }
    }
  `;

  try {
    const response = await axios.post(EAS_GRAPHQL_ENDPOINT, {
      query,
      variables: { schema: schemaUID, attester }
    });

    const attestations = response.data.data.attestations || [];
    const dates = new Set();

    attestations.forEach(att => {
      try {
        const decoded = JSON.parse(att.decodedDataJson);
        const dateItem = decoded.find(item => item.name === 'date');
        if (dateItem && dateItem.value && dateItem.value.value) {
          dates.add(dateItem.value.value);
        }
      } catch (e) {
        // Skip malformed attestations
      }
    });

    console.log(`Fetched ${dates.size} unique anchored dates from EAS.`);
    return dates;
  } catch (error) {
    console.error('Error fetching anchored dates from EAS:', error.message);
    return new Set(); // Fallback to empty set to allow progress, but warning is logged
  }
}

module.exports = { getAnchoredDates };
