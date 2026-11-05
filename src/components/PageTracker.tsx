import { useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { usePath } from '../lib/router';
import { tracker } from '../lib/track';

/** Sends a page view on every route change; stays silent for signed-in admins. */
export function PageTracker() {
  const path = usePath();
  const { user, ready } = useAuth();
  const isAdmin = !!user?.isAdmin;

  useEffect(() => {
    if (isAdmin) tracker.disable();
  }, [isAdmin]);

  useEffect(() => {
    // Wait for the account answer so an admin's first page view is not counted.
    if (ready) tracker.pageview(path);
  }, [path, ready]);

  return null;
}
