const BASIN_MAPPING = {
  'test-preserved': 'Valle de México',
  'test-1': 'Lerma-Chapala',
  'test-2': 'Valle de México',
  '027535d4-053b-4160-b324-f396840fcb5e': 'Cuautitlán'
};

const CONVERSION_FACTORS = {
  FLOWMETER_LITERS_PER_PULSE: 1.5,
  RAIN_GAUGE_LITERS_PER_TIP: 0.25,
};

function calculateLiters(record) {
  const { data } = record.content;
  let liters = 0;

  if (data.pulses) {
    const isRain = record.filename.includes('captado');
    const factor = isRain ? CONVERSION_FACTORS.RAIN_GAUGE_LITERS_PER_TIP : CONVERSION_FACTORS.FLOWMETER_LITERS_PER_PULSE;
    liters = data.pulses * factor;
  } else if (data.meters) {
    liters = data.meters * 1000; 
  }

  return liters;
}

function aggregateByBasin(records) {
  const aggregation = {};
  const seenFilenames = new Set();

  records.forEach(record => {
    const filename = record.filename;
    
    // Skip if we've already processed this exact sensor reading
    if (seenFilenames.has(filename)) return;
    seenFilenames.add(filename);

    const tlaloqueId = record.content.data.tlaloque_id;
    const basin = BASIN_MAPPING[tlaloqueId] || 'Unknown Basin';
    const liters = calculateLiters(record);

    if (!aggregation[basin]) {
      aggregation[basin] = {
        totalLiters: 0,
        recordCount: 0,
        tlaloques: new Set()
      };
    }

    aggregation[basin].totalLiters += liters;
    aggregation[basin].recordCount += 1;
    aggregation[basin].tlaloques.add(tlaloqueId);
  });

  Object.keys(aggregation).forEach(basin => {
    aggregation[basin].tlaloques = Array.from(aggregation[basin].tlaloques);
  });

  return aggregation;
}

module.exports = { calculateLiters, aggregateByBasin, BASIN_MAPPING };
