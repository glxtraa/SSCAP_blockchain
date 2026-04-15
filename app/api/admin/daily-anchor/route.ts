import { runTier1 } from '../../../scripts/tier1_orchestrate';

export async function POST(req) {
  const authHeader = req.headers.get('Authorization');
  const password = process.env.ADMIN_PASSWORD;

  if (authHeader !== `Bearer ${password}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const result = await runTier1();
    return new Response(JSON.stringify({ result: `Success: ${result.attestationUID}` }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
