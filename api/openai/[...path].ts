export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  // Strip /api/openai prefix to get the OpenAI path
  const openaiPath = url.pathname.replace(/^\/api\/openai/, '');
  const openaiUrl = `https://api.openai.com${openaiPath}`;

  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Authorization header required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: authHeader,
  };

  const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined;

  const response = await fetch(openaiUrl, {
    method: req.method,
    headers,
    body,
  });

  const responseBody = await response.text();
  return new Response(responseBody, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('content-type') ?? 'application/json' },
  });
}
