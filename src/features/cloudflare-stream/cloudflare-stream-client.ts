import { env } from '@/env';

const CLOUDFLARE_STREAM_BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/stream`;

export async function cloudflareStreamFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${CLOUDFLARE_STREAM_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.CLOUDFLARE_STREAM_API_TOKEN}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  const responseBody = await response.json();
  if (!response.ok || !responseBody.success) {
    throw new Error(`Cloudflare Stream API error: ${JSON.stringify(responseBody.errors ?? responseBody)}`);
  }

  return responseBody.result as T;
}
