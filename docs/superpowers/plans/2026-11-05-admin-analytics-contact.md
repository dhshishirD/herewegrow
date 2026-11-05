# Admin Analytics + Contact Inbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the owner an `/admin` dashboard (live visitors, ranges, pages, sources/UTM, audience, actions, funnel, revenue) and a site contact form with an admin inbox.

**Architecture:** First-party events written to D1 by a small client tracker via `POST /api/t`; read-only aggregate queries in `server/stats.ts` served under `/api/admin/*` behind the existing `requireAdmin`; `purchase` events written server-side in the verify path; the existing daily cron rolls events older than 90 days into `daily_rollup`.

**Tech Stack:** Cloudflare Worker + D1 + KV, TypeScript, React 19 + Tailwind 4, Vitest (`fakeD1`/`fakeKV` from `server/testkit.ts`; `fakeD1` applies every file in `migrations/` automatically).

**Spec:** `docs/superpowers/specs/2026-11-05-admin-analytics-contact-design.md`

## Global Constraints
- Day boundary is Asia/Dhaka (UTC+6, no DST); `day` is `YYYY-MM-DD`; all times Unix ms.
- Visitor id `vid` = random UUID in localStorage; session `sid` = sessionStorage, rolls after 30 min idle. No cookies, no IPs, no names/phones in `events`.
- Raw events kept 90 days; then `daily_rollup`. Admin traffic is never tracked.
- `/api/t` always answers `204` (except bad origin `403`); body <= 1024 bytes; `meta` <= 300 chars; per-`vid` cap 300 events per Dhaka day. (Final review: the original KV key `evcap:<vid>:<day>` was replaced by a D1 count on `events_vid_ts` plus a per-isolate per-IP limit — no KV writes on `/api/t`.)
- Contact: rate limit 3 per 10 min per IP (KV), honeypot field `website`, Turnstile only when `TURNSTILE_SECRET` is set, message <= 2000 chars.
- Admin routes use `requireAdmin` and the same-origin check in `server/admin.ts`; DB errors return `{ ok:false, error:'db' }` 500.
- Follow repo patterns: handlers return `json(...)` from `server/paymently.ts`; D1 typed as `D1Like`; each PR must pass `npm run lint && npm test && npm run build`.
- Commit messages end with the two attribution lines required by the session.

## Review Focus
1. Garbage, oversize or non-JSON body to `/api/t` → `204`, nothing stored, no throw (Task 1).
2. Bot / crawler User-Agent → `204`, nothing stored (Task 1).
3. Event at 17:59:59 UTC vs 18:00:00 UTC lands on different Dhaka days (Task 1).
4. Verify called twice for one invoice → exactly one `purchase` event (Task 4).
5. Browser with blocked storage → tracker still works with in-memory ids, never throws (Task 2).
6. UTM values with spaces/symbols/very long text are sanitised to `[a-z0-9_.-]`, <= 40 chars (Task 1).
7. Contact message containing `<script>` is stored verbatim and rendered as text (Task 5).

---

### Task 1: Migration, event core and ingest endpoint

**Files:**
- Create: `migrations/0005_analytics.sql`, `server/analytics.ts`, `server/analyticsHandlers.ts`
- Modify: `worker/index.ts` (route `POST /api/t` before the generic POST-only block)
- Test: `server/analytics.test.ts`

**Interfaces:**
- Produces (`server/analytics.ts`):
  - `interface TrackInput { vid: string; sid: string; type: 'pageview'|'event'; name: string|null; path: string; ref: string|null; utmSource: string|null; utmMedium: string|null; utmCampaign: string|null; meta: string|null }`
  - `parseTrack(body: unknown): TrackInput | null` (null when invalid)
  - `isBot(userAgent: string | null): boolean`
  - `deviceOf(userAgent: string | null): 'mobile'|'tablet'|'desktop'`
  - `dhakaDay(ts: number): string`
  - `recordEvent(db: D1Like, input: TrackInput, ctx: { ts: number; country: string|null; device: string; userId: string|null }): Promise<void>`
  - `recordServerEvent(db: D1Like, e: { name: string; vid: string|null; userId: string|null; meta?: Record<string, unknown>; dedupeKey: string; ts?: number }): Promise<boolean>` (true if inserted, false if the key already existed)
- Produces (`server/analyticsHandlers.ts`): `handleTrack(request: Request, env: AuthEnv): Promise<Response>`

- [ ] **Step 1: Write failing tests** in `server/analytics.test.ts`: `dhakaDay` maps `Date.UTC(2026,10,5,17,59,59)` → `2026-11-05` and `Date.UTC(2026,10,5,18,0,0)` → `2026-11-06`; `parseTrack` returns null for non-object, missing `vid`/`path`, `type` other than the two allowed, path not starting with `/`; trims `path` to 200 chars, `meta` to 300; sanitises `utmSource` input `"Face Book!!"` → `face-book` pattern `[a-z0-9_.-]` max 40 (test the exact output you choose and assert only allowed characters and length); `isBot('Googlebot/2.1')` true, `isBot('Mozilla/5.0 (iPhone ...) Safari')` false, empty/null UA treated as bot; `deviceOf` iPhone UA → `mobile`, iPad UA → `tablet`, Windows Chrome → `desktop`.
- [ ] **Step 2: Write failing handler tests** (same file, `fakeD1`/`fakeKV`, requests with `Origin` = site): valid pageview → `204` and one `events` row with `day` set, `country` from `request.cf?.country`; bad origin → `403`; 2 KB body → `204`, 0 rows; invalid JSON → `204`, 0 rows; bot UA → `204`, 0 rows; 301st event from one `vid` in a day → `204`, still 300 rows; `recordServerEvent` twice with the same `dedupeKey` → `true` then `false`, one row.
- [ ] **Step 3: Run** `npx vitest run server/analytics.test.ts` — expect FAIL (modules missing).
- [ ] **Step 4: Create `migrations/0005_analytics.sql`** exactly per spec section 3 (`events` incl. `dedupe_key TEXT UNIQUE`, indexes `events_day(day, type)` and `events_ts(ts)`, `daily_rollup`, `contact_messages`), `CREATE ... IF NOT EXISTS` like earlier migrations, with the same "apply by hand in the D1 Console, one statement at a time" header comment.
- [ ] **Step 5: Implement `server/analytics.ts`** with the signatures above. `isBot`: regex for `bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|curl|wget|python|node-fetch` plus empty UA. `dhakaDay`: shift by +6 h and format the UTC date.
- [ ] **Step 6: Implement `handleTrack`** in `server/analyticsHandlers.ts`: origin check → read text, reject >1024 bytes → parse → `parseTrack` → bot check → KV cap via the same counter pattern as `allow` in `server/auth.ts` (`evcap:<vid>:<day>`, TTL 86400) → `recordEvent` with `userId` from `getSessionUser` only used to flag admins (admins are dropped, not recorded). Wrap everything so failures are `console.error`'d and still return `204`. Add the route in `worker/index.ts`.
- [ ] **Step 7: Run** `npx vitest run server/analytics.test.ts` — expect PASS; then `npm run lint && npm test` — expect all green.
- [ ] **Step 8: Commit** `feat(analytics): events table and /api/t ingest`.

### Task 2: Client tracker and wiring

**Files:**
- Create: `src/lib/track.ts`, `src/components/PageTracker.tsx`
- Modify: `src/App.tsx` (render `<PageTracker />` inside `AuthProvider`), `src/components/Checkout.tsx` and `src/lib/orders.ts` (send `vid` in the checkout body), call sites for the named events (see Step 5)
- Test: `src/lib/track.test.ts`

**Interfaces:**
- Consumes: `POST /api/t` payload from Task 1; `useAuth()` (`user.isAdmin`) from `src/lib/auth.tsx`; `usePath()` from `src/lib/router.tsx`.
- Produces (`src/lib/track.ts`):
  - `createTracker(deps: { storage: Pick<Storage,'getItem'|'setItem'>|null; session: Pick<Storage,'getItem'|'setItem'>|null; send: (body: object) => void; now: () => number; referrer: string; search: string; gtag?: (...a: unknown[]) => void }): { pageview(path: string): void; event(name: string, meta?: Record<string, string|number>): void; vid(): string; disable(): void }`
  - `tracker` (default instance bound to `window`) and `track(name, meta?)`.
- `PageTracker` calls `tracker.pageview(path)` on every `usePath()` change and `tracker.disable()` when `user?.isAdmin`.

- [ ] **Step 1: Write failing tests** in `src/lib/track.test.ts`: first `pageview` sends `{vid, sid, type:'pageview', path, ref, utm...}` with UTM parsed from `search`; second pageview in the same session sends no `ref`/utm again; `sid` changes after 31 minutes idle (inject `now`); `event('cta_whatsapp_click')` also calls injected `gtag('event', name, meta)`; after `disable()` nothing is sent; with `storage = null` and `session = null` it still sends using in-memory ids and does not throw; `send` throwing does not throw out of `pageview`.
- [ ] **Step 2: Run** `npx vitest run src/lib/track.test.ts` — expect FAIL.
- [ ] **Step 3: Implement `createTracker`** per the interface. `send` default uses `fetch('/api/t', { method:'POST', keepalive:true, headers:{'Content-Type':'application/json'}, body })` with `.catch(() => {})`. Respect `localStorage.hwg_noTrack === '1'` by starting disabled.
- [ ] **Step 4: Implement `PageTracker`** and render it in `src/App.tsx`.
- [ ] **Step 5: Add `track(...)` calls** (one line each, no behaviour change): `view_service`, `view_template`, `view_pro` on those pages; `order_start` when `Order.tsx` form first receives input; `checkout_click` where `Checkout.tsx` submits; `cta_whatsapp_click` on every element built with `whatsappLink(...)` (`Footer.tsx`, `Home.tsx`, `About.tsx`, `Policies.tsx`); `login_success` in `src/lib/auth.tsx` after login; `cv_export` in `src/pages/Builder.tsx` export handlers; `pro_click` on Pro CTA buttons in `src/pages/Pro.tsx`. Also include `vid: tracker.vid()` in the checkout request body (Task 4 reads it).
- [ ] **Step 6: Run** `npx vitest run src/lib/track.test.ts` — PASS; `npm run lint && npm test && npm run build` — green.
- [ ] **Step 7: Commit** `feat(analytics): client tracker and core events`.

### Task 3: Stats queries, admin read APIs and dashboard page

**Files:**
- Create: `server/stats.ts`, `src/pages/AdminDashboard.tsx`
- Modify: `server/admin.ts` (new routes), `src/App.tsx` (`'/admin': AdminDashboardPage`), admin page nav links in `AdminCareers.tsx` and `AdminPromos.tsx`
- Test: `server/stats.test.ts`, extend `server/admin.test.ts`

**Interfaces:**
- Consumes: `events` rows from Task 1.
- Produces (`server/stats.ts`), all take `db: D1Like` and `r: Range`, where `interface Range { from: string; to: string }` (inclusive Dhaka days):
  - `parseRange(params: URLSearchParams, now?: number): Range | null` (accepts `from`/`to` as `YYYY-MM-DD`, or `preset=today|yesterday|7d|30d`; null if invalid, from > to, or span > 366 days)
  - `liveNow(db, now?): Promise<{ count: number; visitors: { page: string; agoSec: number }[] }>` (last 5 min, latest page per `vid`)
  - `overview(db, r): Promise<{ visitors: number; sessions: number; pageviews: number; bounceRate: number; pagesPerSession: number; daily: { day: string; visitors: number; pageviews: number }[] }>`
  - `topPages(db, r)`: `{ path; views; visitors }[]`; `entryPages(db, r)`: `{ path; sessions }[]`
  - `sources(db, r)`: `{ source; medium; campaign; visitors }[]` (source falls back to `ref_host`, then `direct`)
  - `audience(db, r)`: `{ devices: {device;visitors}[]; countries: {country;visitors}[]; newVsReturning: { new: number; returning: number } }`
  - `actions(db, r)`: `{ name; n; visitors }[]`
- Routes (GET, admin): `/api/admin/stats/live`, `/api/admin/stats/overview`, `/api/admin/stats/pages`, `/api/admin/stats/sources`, `/api/admin/stats/audience`, `/api/admin/stats/actions` (range via query; bad range → 400 `{error:'range'}`).

- [ ] **Step 1: Write failing tests** in `server/stats.test.ts` seeding `events` through `recordEvent`: two visitors across two Dhaka days produce correct visitors/sessions/pageviews; a single-pageview session counts as a bounce (`bounceRate` = bounces / sessions); `liveNow` counts a `vid` seen 4 min ago and not one seen 6 min ago; `newVsReturning` treats a `vid` whose first event is before `r.from` as returning; `sources` groups `utm_source=facebook` separately from `direct`; `parseRange` rejects a 400-day span and bad strings. Extend `server/admin.test.ts`: every new route returns `401` anonymous, `403` for a non-admin, `200` for an admin.
- [ ] **Step 2: Run** `npx vitest run server/stats.test.ts server/admin.test.ts` — expect FAIL.
- [ ] **Step 3: Implement `server/stats.ts`** with plain SQL aggregates over `events` (`COUNT(DISTINCT vid)`, `COUNT(DISTINCT sid)`, grouped by `day`). Ranges that start before the 90-day horizon read `daily_rollup` for visitors/pageviews/pages/sources/actions only (wired in Task 6; until then return events only).
- [ ] **Step 4: Add the admin routes** in `server/admin.ts` using `parseRange`; keep each handler a one-liner calling `stats.ts`.
- [ ] **Step 5: Run** the two test files — PASS.
- [ ] **Step 6: Implement `src/pages/AdminDashboard.tsx`** following `AdminPromos.tsx` conventions (`useAuth`, hides itself for non-admins, plain `fetch`): live card polling every 15 s; preset buttons Today / Yesterday / 7 days / 30 days and a custom from/to; KPI row (visitors, sessions, page views, bounce, pages/session); daily bar chart (simple SVG or CSS bars, no new dependency); tables for pages, sources, audience, actions. All visitor-supplied text is rendered as React text, never `dangerouslySetInnerHTML`. Texts follow the site's EN/বাংলা `useLang` pattern only if the other admin pages do; otherwise English.
- [ ] **Step 7: Run** `npm run lint && npm test && npm run build` — green; open `/admin` with `npm run dev` and confirm it renders for an admin.
- [ ] **Step 8: Commit** `feat(admin): analytics dashboard`.

### Task 4: Purchase event, funnel and revenue

**Files:**
- Modify: `server/handlers.ts` (checkout metadata + both paid paths in verify), `server/stats.ts`, `server/admin.ts`, `src/pages/AdminDashboard.tsx`
- Test: `server/handlers.test.ts` (extend), `server/stats.test.ts` (extend)

**Interfaces:**
- Consumes: `recordServerEvent` (Task 1); `CheckoutBody` gains `vid?: unknown` (string <= 64 chars, sanitised with the existing `clean`); payment `metadata` gains `vid`.
- Produces (`server/stats.ts`):
  - `funnel(db, r): Promise<{ steps: { key: 'visit'|'viewed'|'order_started'|'paid'; visitors: number }[] }>` (viewed = any of `view_service|view_template|view_pro`; order_started = `order_start` or `checkout_click`; paid = `purchase`)
  - `revenue(db, now?): Promise<{ today: number; week: number; proActivations: number; orders: number }>` from `orders` (`amount_bdt`, `paid_at`, Dhaka day) and `pass_grants`
  - `sources` gains `paid: number` per source using the purchase event's `meta.source`
- Route: `GET /api/admin/stats/funnel`, `GET /api/admin/stats/revenue`.

- [ ] **Step 1: Write failing tests**: in `handlers.test.ts`, a COMPLETED verify for a template order and for a Pro pass each write one `events` row with `name='purchase'`, `dedupe_key='purchase:<invoiceId>'`, `meta` containing `amount` and `product`; calling verify twice leaves one row; a gateway-mismatch (unpaid) verify writes none; `source` in `meta` equals the first-seen `utm_source` of that `vid` (seed with `recordEvent`). In `stats.test.ts`: funnel counts a visitor once per step; `revenue` sums only paid orders for the current Dhaka day/week.
- [ ] **Step 2: Run** `npx vitest run server/handlers.test.ts server/stats.test.ts` — expect FAIL.
- [ ] **Step 3: Implement**: put `vid` into checkout metadata (template and Pro checkouts); add `trackPurchase(db, {invoiceId, productId, amount, vid, userId})` in `server/analytics.ts` that looks up the first `utm_source` for `vid` and calls `recordServerEvent` with `dedupeKey: 'purchase:'+invoiceId`; call it after `recordOrder`/`grantPass` succeed in `handleVerify` and `verifyPlan`, `.catch(console.error)` so it never blocks the buyer.
- [ ] **Step 4: Add `funnel`, `revenue`, routes and dashboard sections** (funnel as horizontal bars with drop-off %, revenue tiles, "paid" column in Sources).
- [ ] **Step 5: Run** the two test files, then `npm run lint && npm test && npm run build` — green.
- [ ] **Step 6: Commit** `feat(analytics): server-side purchase event, funnel, revenue`.

### Task 5: Contact form and inbox

**Files:**
- Create: `server/contact.ts`, `src/components/ContactWidget.tsx`
- Modify: `worker/index.ts` (`POST /api/contact`), `server/admin.ts` (inbox routes), `src/App.tsx` (render widget + `/contact` route), `src/pages/AdminDashboard.tsx` (inbox section + unread badge), `src/components/Footer.tsx` (link)
- Test: `server/contact.test.ts`, extend `server/admin.test.ts`

**Interfaces:**
- Produces (`server/contact.ts`):
  - `handleContact(request: Request, env: AuthEnv): Promise<Response>` — body `{ name, phone, email?, message, page?, vid?, utmSource?, website?, turnstile? }`; `201 {ok:true}`; errors `400 invalid` (with `errors: string[]`), `429 rate`, `400 captcha`, `403 origin`; a filled `website` honeypot returns `201` and stores nothing.
  - `listContacts(db, status?: 'new'|'replied'|'closed'): Promise<ContactRow[]>`, `setContactStatus(db, id: string, status, note?: string): Promise<boolean>`, `countNewContacts(db): Promise<number>`.
  - Admin routes: `GET /api/admin/contacts?status=`, `POST /api/admin/contacts/:id` body `{status, note?}`, and `new` count included in `GET /api/admin/stats/live` response as `newMessages`.
- Phone validated with `normalizePhone` from `server/auth.ts`.

- [ ] **Step 1: Write failing tests**: valid submit stores a row with status `new`, `page`, `utm_source`; invalid phone → `400`; message > 2000 chars is cut to 2000; honeypot filled → `201`, 0 rows; 4th submit from one IP in 10 minutes → `429`; a message `<script>alert(1)</script>` is stored verbatim; admin list is `403` for non-admins; `setContactStatus` updates status and note; `countNewContacts` counts only `new`.
- [ ] **Step 2: Run** `npx vitest run server/contact.test.ts server/admin.test.ts` — expect FAIL.
- [ ] **Step 3: Implement `server/contact.ts`**, reusing the Turnstile helper from `authHandlers.ts` (export it as `turnstileOk` and import it; no copy) and the KV rate-limit pattern; add routes.
- [ ] **Step 4: Implement `ContactWidget.tsx`**: floating "Message us" button opening a small form (name, phone, message, hidden `website` input); on success show a thank-you plus the WhatsApp link; on failure show the WhatsApp link only. Sends `page=location.pathname`, `vid=tracker.vid()`, `utmSource` from the stored session UTM, and calls `track('contact_submit')`.
- [ ] **Step 5: Inbox UI** in the dashboard: filter tabs, message cards (name, phone, page, source, time), buttons Replied / Closed, note field, "Reply on WhatsApp" link built with `whatsappLink`-style `https://wa.me/88<phone>`; unread badge from `newMessages`. Text rendered as React text.
- [ ] **Step 6: Run** both test files — PASS; `npm run lint && npm test && npm run build` — green.
- [ ] **Step 7: Commit** `feat(contact): site contact form and admin inbox`.

### Task 6: Retention rollup, cron and privacy note

**Files:**
- Create: `server/retention.ts`
- Modify: `worker/index.ts` (`scheduled`), `server/stats.ts` (read `daily_rollup` for old ranges), `src/pages/Policies.tsx` (privacy paragraph)
- Test: `server/retention.test.ts`

**Interfaces:**
- Produces: `rollupOld(db: D1Like, now?: number, keepDays = 90, batch = 5000): Promise<{ days: number; deleted: number }>` — for each Dhaka day older than `keepDays`, writes `daily_rollup` rows with metrics `visitors|sessions|pageviews` (key `*`), `page` (key path, n views), `source` (key source, n visitors), `event` (key name, n), `purchase` (key `*`, n), then deletes that day's `events` in batches of `batch`.

- [ ] **Step 1: Write failing tests**: events 91+ days old are summarised and deleted; events 89 days old are untouched; running `rollupOld` twice does not double the totals (use `INSERT ... ON CONFLICT(day, metric, key) DO UPDATE SET n = excluded.n` after recomputing, and only delete after the write succeeds); `overview` over a fully rolled-up range returns daily visitors/pageviews from `daily_rollup`.
- [ ] **Step 2: Run** `npx vitest run server/retention.test.ts` — expect FAIL.
- [ ] **Step 3: Implement `rollupOld`** and call it from `scheduled` in `worker/index.ts` inside the existing `ctx.waitUntil` chain, logging the result.
- [ ] **Step 4: Teach `stats.ts` `overview`, `topPages`, `sources`, `actions`** to read `daily_rollup` for days older than the horizon (visitors for a multi-day old range are the sum of daily uniques; show a small "approximate" note on the dashboard for ranges that include rolled-up days).
- [ ] **Step 5: Add the privacy paragraph** to `src/pages/Policies.tsx` (what is collected, no IP/cookies, 90 days, contact form data used only to reply).
- [ ] **Step 6: Run** `npm run lint && npm test && npm run build` — green.
- [ ] **Step 7: Commit** `feat(analytics): 90-day rollup, cron, privacy note`.

## Rollout notes (for the owner, after each merge)
- Before deploying: apply `migrations/0005_analytics.sql` in the D1 Console one statement at a time (same as 0003/0004); confirm 0003 and 0004 were applied first. Do not use `wrangler d1 migrations apply` (`d1_migrations` is empty).
- Recommended: add a Cloudflare WAF rate-limiting rule on `/api/t` (e.g. about 60 requests per 10 seconds per IP, Block). The in-Worker per-IP limit is best-effort per isolate; the WAF rule protects the D1 write budget (roughly 10–12k events/day on D1 Free, an estimate).
- Ad links: use `?utm_source=facebook&utm_medium=paid&utm_campaign=<name>`.
- Optional: set `TURNSTILE_SECRET` to enable the captcha on login codes and the contact form.
