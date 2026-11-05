# HWG Admin Dashboard: Analytics + Contact Inbox — Design Spec

Date: 2026-11-05 · Owner: Daloyar Hassan Shishir · Status: draft for review

## 1. Goal
One admin page (`/admin`) that shows who visits the site, what they view and do, how many are on the site right now, which ads/sources bring buyers, and a place where visitors can message the owner. Ads are already running, so the funnel and source views matter as much as raw visitor counts.

## 2. Decisions
- **First-party tracking in D1** (approach A). No new vendor. GA4 stays for Google's own reports; we also mirror key events to `gtag` so ad conversions work.
- **Visitor = random browser ID** (localStorage `vid`), session = `sid` (sessionStorage, 30 min idle). No IPs stored, no names, no cookies. Numbers will differ somewhat from GA4.
- **Day boundary = Asia/Dhaka** (UTC+6, no DST). `day` is stored as `YYYY-MM-DD`.
- **Raw events kept 90 days**, then rolled into daily totals by the existing daily cron.
- **Admins are excluded**: tracker is off for signed-in admins and for a browser flagged `hwg_noTrack=1`.
- **Contact inbox** in the dashboard; WhatsApp button stays as the fast route. No outbound notification in v1 (see Open items).

## 3. Data model (migration `0005_analytics.sql`)
```
events(id INTEGER PK AUTOINCREMENT, ts INTEGER, day TEXT, vid TEXT, sid TEXT,
       type TEXT CHECK(type IN ('pageview','event')), name TEXT, path TEXT,
       ref_host TEXT, utm_source TEXT, utm_medium TEXT, utm_campaign TEXT,
       device TEXT, country TEXT, user_id TEXT NULL, meta TEXT)   -- meta: small JSON, <= 300 chars
INDEX events_day(day, type), events_ts(ts)
daily_rollup(day TEXT, metric TEXT, key TEXT, n INTEGER, PRIMARY KEY(day, metric, key))
contact_messages(id TEXT PK, created_at INTEGER, name TEXT, phone TEXT, email TEXT NULL,
       message TEXT, page TEXT, vid TEXT NULL, utm_source TEXT NULL,
       status TEXT CHECK(status IN ('new','replied','closed')) DEFAULT 'new', note TEXT NULL)
```
Times are Unix ms. Index writes count toward D1 write limits (see Risks).

## 4. Ingest
`POST /api/t` (beacon, JSON <= 1 KB, via `navigator.sendBeacon`):
`{vid, sid, type, name?, path, ref?, utm?, meta?}`.
Server: origin check; drop bots by User-Agent pattern; validate/trim every field; `country` from `request.cf`; `device` (mobile/desktop/tablet) from User-Agent; `ref_host` = host of referrer only; per-`vid` cap (KV counter, 300 events/day); always answer `204` so the tracker never blocks the page. Failures are logged, never shown.

### Events tracked
`pageview` (every route change) · `view_service`, `view_template`, `view_pro` · `order_start`, `checkout_click` · `cta_whatsapp_click` · `login_success` · `cv_export` · `contact_submit` · `pro_click`.
`purchase` is written **server-side** inside the existing verify/grant path (amount, product, source from the original visit), so ad-blockers cannot hide a sale. Duplicate verify calls write one event (keyed by order id).

### Client
`src/lib/track.ts`: creates `vid`/`sid`, reads UTM + `document.referrer` on first hit of a session, sends pageviews from the router (`usePath`) and exposes `track(name, meta)`. It also calls `gtag('event', name, ...)` when present.

## 5. Contact
Floating "Message us" button + `/contact` section (name, phone, message; email optional; hidden honeypot field). `POST /api/contact`: origin check, honeypot, length caps, rate limit 3 per 10 min per IP via KV, Turnstile when `TURNSTILE_SECRET` is set (same helper as login). Stores the page, `vid` and `utm_source`, so you can see which ad a message came from. Admin inbox: list with New/Replied/Closed filters, one-click "Open WhatsApp reply" link, private note field.

## 6. Admin dashboard (`/admin`, admin only)
All routes under `/api/admin/*` reuse `requireAdmin` + origin check. Pages link to existing `/admin/careers` and `/admin/promos`.
- **Live:** distinct `vid` with an event in the last 5 min, with each one's current page and how long ago. Polls every 15 s.
- **Range picker:** Today, Yesterday, 7 days, 30 days, custom. Totals: visitors, sessions, page views, bounce (single-pageview sessions), avg pages/session. Daily chart. Compare with the previous period.
- **Pages:** top pages, entry pages, exit pages.
- **Sources:** referrer host, `utm_source/medium/campaign`, with visitors, orders started and paid per source (this is the ad view).
- **Audience:** device split, country, new vs returning (`vid` first seen).
- **Actions:** counts per event name; click to see recent occurrences.
- **Funnel:** visitors → viewed service/template/pro → order started → paid, with drop-off per step.
- **Inbox:** unread badge on the dashboard header.
- **Revenue today / this week** from paid orders, plus Pro activations.
Ranges older than 90 days read from `daily_rollup`; recent ranges read from `events`.

## 7. Retention and cost
The daily cron (already 03:31 UTC) rolls events older than 90 days into `daily_rollup` (visitors, pageviews per path, per source, per event) and deletes them in batches.

## 8. Security and privacy
Admin-only reads. No IP, name or phone in `events`. Beacon payload is validated and size-capped; counts per `vid` capped. Contact messages are PII: stored only in D1, visible only to admins, deletion on request. Privacy page gets a short note on first-party analytics. Dashboard output is escaped (no raw HTML from visitor-supplied fields such as `utm_*` or `message`).

## 9. Error handling
Tracking failure never affects the page. Admin API DB errors return `{error:'db'}` like the existing admin routes; the page shows a plain message. Contact failure shows a WhatsApp fallback link.

## 10. Testing
Vitest: payload validation and trimming, bot filter, per-vid cap, Dhaka day boundary, live-count window, funnel/bounce/new-vs-returning math, rollup and retention, admin authz on every new route, contact rate limit and honeypot, purchase event idempotency. Playwright smoke (when the CI smoke job exists): visit with UTM → page shows in live → contact form → inbox.

## 11. Delivery (small PRs)
1. Migration 0005 + `/api/t` ingest + tests
2. `track.ts` client + core events + GA4 mirror
3. Admin read APIs + `/admin` dashboard (live, range, pages, sources, audience)
4. Server-side `purchase` event + funnel + revenue
5. Contact form + `/api/contact` + inbox
6. Retention/rollup in the daily cron + privacy note

## 12. Risks
- **D1 write volume.** Each event costs about 3 row writes (row + 2 indexes). The free plan allows 100k writes/day, so roughly 30k events/day; the Workers Paid plan raises this a lot. Mitigations: per-vid cap, bot filter, and no tracking of admin traffic. If volume outgrows this, the ingest module can switch to Analytics Engine without changing the dashboard's API.
- **Numbers will not match GA4** exactly (different visitor definition, ad-blockers hide the beacon for some users; `purchase` is server-side so it is complete).

## 13. Open items (need your call)
1. Notify you of new contact messages by SMS (BulkSMSBD, costs credit) in a later PR, or only check the inbox?
2. Which ad platform and UTM naming do you use (e.g. Facebook: `utm_source=facebook&utm_campaign=...`)? I will give you a ready-to-paste link format.
3. Apply `0005` by hand in the D1 Console after merge, same as 0003/0004 (I'll give you the exact lines).

## 14. Out of scope
Heatmaps and session replay, A/B testing, email marketing, automatic job matching, chat widget, customer-facing dashboards.
