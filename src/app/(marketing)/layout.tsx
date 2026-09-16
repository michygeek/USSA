import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { getAuthenticatedUserFromSession } from '@/features/auth/get-authenticated-user';

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const authenticatedUser = await getAuthenticatedUserFromSession();

  return (
    <>
      <SiteHeader authenticatedUser={authenticatedUser} />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
