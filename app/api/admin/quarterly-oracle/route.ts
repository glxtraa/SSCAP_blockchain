import { runQuarterlyOracle } from '../../../scripts/quarterly-oracle';
import { downloadData } from '../../../scripts/data-downloader';

export async function POST(req) {
  const authHeader = req.headers.get('Authorization');
  const password = process.env.ADMIN_PASSWORD;

  if (authHeader !== `Bearer ${password}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    // 1. Fetch data (In a real scenario, this would query EAS anchors for the whole quarter)
    const records = await downloadData(); 
    
    // 2. Run Oracle for a specific basin/quarter (Hardcoded for demonstration)
    const result = await runQuarterlyOracle('Valle de México', '2026-Q1', records);
    
    return new Response(JSON.stringify({ result: `Success: ${result}` }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
