// Client reviews shown on the site. Add only real reviews, with the client's permission.
// The reviews section stays hidden until at least one review is added here.

import type { Bilingual } from './catalog';

export interface Review {
  name: string;
  /** Job or situation, e.g. "Junior Officer, private bank". */
  role: Bilingual;
  quote: Bilingual;
  /** Optional photo path under /public/reviews/. */
  photo?: string;
  /** 1–5 */
  rating: number;
}

export const REVIEWS: Review[] = [];
