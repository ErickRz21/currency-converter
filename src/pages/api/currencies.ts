import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    const res = await fetch('https://api.frankfurter.dev/v2/currencies');

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Upstream error: ${res.status}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // v2 returns an array of objects; transform into { CODE: name } map
    const data: { iso_code: string; name: string }[] = await res.json();
    const map: Record<string, string> = {};
    for (const currency of data) {
      map[currency.iso_code] = currency.name;
    }

    return new Response(JSON.stringify(map), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Failed to reach currency list service' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
