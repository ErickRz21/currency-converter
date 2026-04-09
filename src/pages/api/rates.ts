import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const base = url.searchParams.get('base')?.toUpperCase() ?? 'USD';

  try {
    const res = await fetch(`https://api.frankfurter.app/latest?base=${base}`);

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Upstream error: ${res.status}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Failed to reach exchange rate service' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
