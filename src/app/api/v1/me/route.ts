import { requireAuthenticatedUser } from '@/features/auth/require-authenticated-user';
import { toApiErrorResponse } from '@/api-response/api-error';

export async function GET(request: Request) {
  try {
    const authenticatedUser = await requireAuthenticatedUser(request);
    return Response.json({
      userId: authenticatedUser.userId,
      email: authenticatedUser.email,
      displayName: authenticatedUser.displayName,
      role: authenticatedUser.role,
    });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
