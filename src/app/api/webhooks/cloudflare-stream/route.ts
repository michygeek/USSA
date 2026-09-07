import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { lessons } from '@/db/schema';
import { env } from '@/env';
import { ApiError, toApiErrorResponse } from '@/api-response/api-error';
import { API_ERROR_CODE } from '@/api-response/api-error-codes';
import { verifyCloudflareStreamWebhookSignature } from '@/features/cloudflare-stream/verify-webhook-signature';

interface CloudflareStreamWebhookEvent {
  uid: string;
  status?: { state?: string };
  readyToStream?: boolean;
  duration?: number;
}

export async function POST(request: Request) {
  try {
    const webhookRawBody = await request.text();
    const signatureHeader = request.headers.get('webhook-signature');

    const isValidSignature = verifyCloudflareStreamWebhookSignature(
      webhookRawBody,
      signatureHeader,
      env.CLOUDFLARE_STREAM_WEBHOOK_SECRET,
    );
    if (!isValidSignature) {
      throw new ApiError(401, API_ERROR_CODE.INVALID_WEBHOOK_SIGNATURE, 'Invalid webhook signature.');
    }

    const webhookEvent: CloudflareStreamWebhookEvent = JSON.parse(webhookRawBody);
    const isVideoReady = webhookEvent.readyToStream === true || webhookEvent.status?.state === 'ready';

    if (isVideoReady && typeof webhookEvent.duration === 'number') {
      await db
        .update(lessons)
        .set({ durationSeconds: Math.round(webhookEvent.duration) })
        .where(eq(lessons.cloudflareStreamVideoId, webhookEvent.uid));
    }

    return Response.json({ received: true });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
