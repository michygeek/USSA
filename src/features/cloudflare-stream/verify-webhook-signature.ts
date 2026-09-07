import { createHmac, timingSafeEqual } from 'node:crypto';

function parseSignatureHeader(signatureHeader: string): { time: string; sig1: string } | null {
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((part) => part.split('=') as [string, string]),
  );
  if (!parts.time || !parts.sig1) return null;
  return { time: parts.time, sig1: parts.sig1 };
}

export function verifyCloudflareStreamWebhookSignature(
  webhookRawBody: string,
  signatureHeader: string | null,
  webhookSecret: string,
): boolean {
  if (!signatureHeader) return false;

  const parsedSignature = parseSignatureHeader(signatureHeader);
  if (!parsedSignature) return false;

  const expectedSignature = createHmac('sha256', webhookSecret)
    .update(`${parsedSignature.time}.${webhookRawBody}`)
    .digest('hex');

  const expectedSignatureBuffer = Buffer.from(expectedSignature);
  const receivedSignatureBuffer = Buffer.from(parsedSignature.sig1);
  if (expectedSignatureBuffer.length !== receivedSignatureBuffer.length) return false;

  return timingSafeEqual(expectedSignatureBuffer, receivedSignatureBuffer);
}
