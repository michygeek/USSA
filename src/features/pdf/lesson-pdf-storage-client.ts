import { getSupabaseAdminClient } from '@/supabase/admin-client';

const LESSON_PDF_BUCKET = 'lesson-pdfs';
const PDF_VIEW_URL_TTL_SECONDS = 60 * 10;

export function buildLessonPdfStoragePath(lessonId: string): string {
  return `${lessonId}/document.pdf`;
}

export async function createLessonPdfUploadUrl(storagePath: string) {
  const supabaseAdminClient = getSupabaseAdminClient();
  const { data, error } = await supabaseAdminClient.storage
    .from(LESSON_PDF_BUCKET)
    .createSignedUploadUrl(storagePath, { upsert: true });
  if (error) throw new Error(`Failed to create PDF upload URL: ${error.message}`);
  return { signedUrl: data.signedUrl, token: data.token, path: data.path };
}

export async function createLessonPdfViewUrl(storagePath: string): Promise<string> {
  const supabaseAdminClient = getSupabaseAdminClient();
  const { data, error } = await supabaseAdminClient.storage
    .from(LESSON_PDF_BUCKET)
    .createSignedUrl(storagePath, PDF_VIEW_URL_TTL_SECONDS);
  if (error) throw new Error(`Failed to create PDF view URL: ${error.message}`);
  return data.signedUrl;
}
