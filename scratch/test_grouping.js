const { downloadData } = require('../scripts/data-downloader');

async function testGrouping() {
  console.log('Testing grouping logic...');
  
  // Mocking the behavior of tier1_orchestrate.js
  const records = [
    { content: { data: { tlaloque_id: 'S1' } }, filename: 'f1' },
    { content: { data: { tlaloque_id: 'S1' } }, filename: 'f2' },
    { content: { data: { tlaloque_id: 'S2' } }, filename: 'f3' },
    { content: { data: { tlaloque_id: 'S3' } }, filename: 'f4' },
  ];

  const groups = {};
  records.forEach(record => {
    const tid = record.content.data.tlaloque_id || 'unknown';
    if (!groups[tid]) groups[tid] = [];
    groups[tid].push(record);
  });

  console.log('Tier 1 Groups:', Object.keys(groups));
  if (Object.keys(groups).length !== 3) throw new Error('Tier 1 grouping failed');

  // Mocking the behavior of backfill_anchors.js
  const allRecords = [
    { content: { created_at: '2024-03-20T10:00:00Z', data: { tlaloque_id: 'S1' } } },
    { content: { created_at: '2024-03-20T11:00:00Z', data: { tlaloque_id: 'S1' } } },
    { content: { created_at: '2024-03-20T12:00:00Z', data: { tlaloque_id: 'S2' } } },
    { content: { created_at: '2024-03-21T10:00:00Z', data: { tlaloque_id: 'S1' } } },
  ];

  const backfillGroups = {};
  allRecords.forEach(record => {
    const date = (record.content.created_at || record.uploadedAt).split('T')[0];
    const tid = record.content.data.tlaloque_id || 'unknown';
    
    if (!backfillGroups[date]) backfillGroups[date] = {};
    if (!backfillGroups[date][tid]) backfillGroups[date][tid] = [];
    backfillGroups[date][tid].push(record);
  });

  console.log('Backfill Days:', Object.keys(backfillGroups));
  console.log('Backfill 2024-03-20 Sensors:', Object.keys(backfillGroups['2024-03-20']));
  
  if (Object.keys(backfillGroups).length !== 2) throw new Error('Backfill date grouping failed');
  if (Object.keys(backfillGroups['2024-03-20']).length !== 2) throw new Error('Backfill sensor grouping failed');

  console.log('All grouping logic tests passed!');
}

testGrouping().catch(console.error);
