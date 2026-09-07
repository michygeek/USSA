import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { verifyCloudflareStreamWebhookSignature } from '@/features/cloudflare-stream/verify-webhook-signature';

const WEBHOOK_SECRET = 'test-webhook-secret';

function buildSignatureHeader(rawBody: string, time: string, secret: string): string {
  const signature = createHmac('sha256', secret).update(`${time}.${rawBody}`).digest('hex');
  return `time=${time},sig1=${signature}`;
}

describe('verifyCloudflareStreamWebhookSignature', () => {
  it('accepts a correctly signed payload', () => {
    const rawBody = JSON.stringify({ uid: 'video-1', readyToStream: true, duration: 42 });
    const signatureHeader = buildSignatureHeader(rawBody, '1700000000', WEBHOOK_SECRET);

    expect(verifyCloudflareStreamWebhookSignature(rawBody, signatureHeader, WEBHOOK_SECRET)).toBe(true);
  });

  it('rejects a payload that was tampered with after signing', () => {
    const rawBody = JSON.stringify({ uid: 'video-1', readyToStream: true, duration: 42 });
    const signatureHeader = buildSignatureHeader(rawBody, '1700000000', WEBHOOK_SECRET);
    const tamperedBody = JSON.stringify({ uid: 'video-1', readyToStream: true, duration: 999999 });

    expect(verifyCloudflareStreamWebhookSignature(tamperedBody, signatureHeader, WEBHOOK_SECRET)).toBe(false);
  });

  it('rejects a signature produced with the wrong secret', () => {
    const rawBody = JSON.stringify({ uid: 'video-1', readyToStream: true, duration: 42 });
    const signatureHeader = buildSignatureHeader(rawBody, '1700000000', 'a-different-secret');

    expect(verifyCloudflareStreamWebhookSignature(rawBody, signatureHeader, WEBHOOK_SECRET)).toBe(false);
  });

  it('rejects a missing signature header', () => {
    const rawBody = JSON.stringify({ uid: 'video-1' });

    expect(verifyCloudflareStreamWebhookSignature(rawBody, null, WEBHOOK_SECRET)).toBe(false);
  });

  it('rejects a malformed signature header', () => {
    const rawBody = JSON.stringify({ uid: 'video-1' });

    expect(verifyCloudflareStreamWebhookSignature(rawBody, 'not-a-valid-header', WEBHOOK_SECRET)).toBe(false);
  });
});
