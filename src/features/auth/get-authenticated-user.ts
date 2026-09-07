import { createRemoteJWKSet, jwtVerify } from 'jose';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { getSupabaseServerClient } from '@/supabase/server-client';
import { env } from '@/env';
import type { AuthenticatedUser } from './auth-types';

// Supabase signs session tokens with a rotating key pair, not a static secret — verify against the published JWKS.
const supabaseAuthIssuer = `${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1`;
const supabaseJwks = createRemoteJWKSet(new URL(`${supabaseAuthIssuer}/.well-known/jwks.json`));

function extractBearerToken(request: Request): string | null {
  const authorizationHeader = request.headers.get('authorization');
  if (!authorizationHeader?.startsWith('Bearer ')) return null;
  return authorizationHeader.slice('Bearer '.length);
}

async function extractCookieAccessToken(): Promise<string | null> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function verifySupabaseAccessToken(supabaseAccessToken: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(supabaseAccessToken, supabaseJwks, {
      issuer: supabaseAuthIssuer,
      audience: 'authenticated',
    });
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

async function getUserRecordById(userId: string) {
  const [userRecord] = await db.select().from(users).where(eq(users.id, userId));
  return userRecord ?? null;
}

async function resolveAuthenticatedUser(supabaseAccessToken: string | null): Promise<AuthenticatedUser | null> {
  if (!supabaseAccessToken) return null;

  const supabaseUserId = await verifySupabaseAccessToken(supabaseAccessToken);
  if (!supabaseUserId) return null;

  const userRecord = await getUserRecordById(supabaseUserId);
  if (!userRecord) return null;

  return {
    userId: userRecord.id,
    email: userRecord.email,
    displayName: userRecord.displayName,
    role: userRecord.role,
  };
}

// Single entry point for identity — bearer header (mobile) or session cookie (web/PWA), never both parsed ad hoc elsewhere.
export async function getAuthenticatedUser(request: Request): Promise<AuthenticatedUser | null> {
  const supabaseAccessToken = extractBearerToken(request) ?? (await extractCookieAccessToken());
  return resolveAuthenticatedUser(supabaseAccessToken);
}

// Cookie-only variant for Server Actions, which receive no Request object to read a bearer header from.
export async function getAuthenticatedUserFromSession(): Promise<AuthenticatedUser | null> {
  const supabaseAccessToken = await extractCookieAccessToken();
  return resolveAuthenticatedUser(supabaseAccessToken);
}
