import { getSupabaseAdminClient } from '@/supabase/admin-client';

const COURSE_THUMBNAIL_BUCKET = 'course-thumbnails';

export function buildCourseThumbnailStoragePath(courseId: string): string {
  return `${courseId}/thumbnail`;
}

export async function createCourseThumbnailUploadUrl(storagePath: string) {
  const supabaseAdminClient = getSupabaseAdminClient();
  const { data, error } = await supabaseAdminClient.storage
    .from(COURSE_THUMBNAIL_BUCKET)
    .createSignedUploadUrl(storagePath, { upsert: true });
  if (error) throw new Error(`Failed to create thumbnail upload URL: ${error.message}`);
  return { signedUrl: data.signedUrl, token: data.token, path: data.path };
}

export function getCourseThumbnailPublicUrl(storagePath: string): string {
  const supabaseAdminClient = getSupabaseAdminClient();
  const { data } = supabaseAdminClient.storage.from(COURSE_THUMBNAIL_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}
