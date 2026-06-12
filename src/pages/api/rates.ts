import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const base = url.searchParams.get('base')?.toUpperCase() ?? 'USD';

  try {
    const res = await fetch(`https://api.frankfurter.dev/v2/rates?base=${base}`);

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Upstream error: ${res.status}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // v2 returns an array [{date, base, quote, rate}]; normalize to v1 shape:
    // { amount: 1, base, date, rates: { CODE: value } }
    const rows: { date: string; base: string; quote: string; rate: number }[] = await res.json();

    const rates: Record<string, number> = {};
    let date = '';
    for (const row of rows) {
      rates[row.quote] = row.rate;
      date = row.date;
    }

    const data = { amount: 1, base, date, rates };

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

