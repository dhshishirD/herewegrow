import { useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { usePath } from '../lib/router';
import { tracker } from '../lib/track';

/** Sends a page view on every route change. Hits are held until the account answer arrives, then dropped for signed-in admins. */
export function PageTracker() {
  const path = usePath();
  const { user, ready } = useAuth();
  const isAdmin = !!user?.isAdmin;

  useEffect(() => {
    tracker.pageview(path);
  }, [path]);

  useEffect(() => {
    if (!ready) return;
    if (isAdmin) tracker.disable();
    tracker.ready();
  }, [ready, isAdmin]);

  return null;
}
