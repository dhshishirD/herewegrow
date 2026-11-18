// Pages that only the app serves (no search page is built for them). The build writes each one as a noindex
// copy of the app shell so it answers 200; any other unknown address gets the real 404 page (dist/404.html).
// Keep in step with ROUTES in src/App.tsx: shared/appPaths.test.ts fails when a route is missing here.

export const APP_ONLY_PATHS = [
  '/order', '/account', '/payment/success', '/payment/cancel',
  '/admin', '/admin/careers', '/admin/promos', '/admin/templates', '/admin/blog', '/admin/customers', '/admin/manual', '/admin/partners',
];

/** Addresses with a code or sub-path that cannot be listed: the Worker answers these with the app shell. */
export function isAppShellPath(pathname: string): boolean {
  return /^\/p\/[a-z0-9]{6,16}$/.test(pathname) || pathname === '/partner' || pathname.startsWith('/partner/');
}
