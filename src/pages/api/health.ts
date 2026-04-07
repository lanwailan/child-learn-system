import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  try {
    return new Response(
      JSON.stringify({ status: 'ok', message: 'Spaced Repetition API Ready' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
