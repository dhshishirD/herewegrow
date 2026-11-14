# Export-Ready Sheet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every free export ends on a "আপনার CV তৈরি!" sheet offering the clean PDF (7-day pass, ৳49), so `paywall_view` ≈ `cv_export` visitors.

**Architecture:** A pure helper decides and tracks the offer after each export; a new `ExportReady` sheet (same pattern as `ProGate`) renders it; `Builder.tsx` calls the helper after PDF/Word exports. A second helper fires `payment_start` right before the redirect to the payment URL.

**Tech Stack:** React + Vite + TypeScript, vitest (`npm test`), Cloudflare Worker backend (unchanged), first-party `track()` from `src/lib/track.ts`.

**Spec:** `docs/superpowers/specs/2026-11-15-export-ready-sheet-design.md`

## Global Constraints

- Free download is never blocked: the file downloads first, the sheet opens after.
- Pro users and Partner client exports (`clientId` set) never see the sheet.
- Price (৳49 / 7 days) appears only on the post-export sheet; take it from `PLANS` (`pro-7`) in `shared/plans.ts`, never hard-code.
- Trust line exactly: `আমরা এজেন্ট নই; ভিসা বা চাকরি বিক্রি করি না`. No promise of jobs, visas or guarantees anywhere in the copy.
- Bilingual via `t({ en, bn })` from `useLang()`; Bangla is the primary read on mobile.
- Do not change `PRO_PUBLIC`, `FUNNEL_STARTED`, `purchase` (already server-side with dedupe) or UTM capture.
- Mobile: no horizontal scroll at 375px, sticky bottom primary button, min tap height 48px.

## Review Focus

- Word export (`downloadWord`) failing/throwing: no sheet, no `paywall_view`.
- Browser cancels the print dialog: `cv_export` already fired, sheet still shows once (acceptable) and never twice for one click.
- Double-tap on Download: one `paywall_view`, not two (sheet already open).
- Free user on a Pro design: existing `ProGate` path unchanged; no extra sheet on top.
- Pro user / Partner client export: no sheet, no `paywall_view`.

---

### Task 1: ExportReady sheet component

**Files:**
- Create: `src/components/ExportReady.tsx`
- Test: `src/components/ExportReady.test.tsx`

**Interfaces:**
- Produces: `export function ExportReady(props: { onClose: () => void }): JSX.Element`

- [ ] **Step 1: Write the failing test** (`renderToString`, same style as `AdminBlogPerformance.test.tsx`) with these assertions: output contains `আপনার CV তৈরি!`, `৳৪৯` (via `taka(pro7.price,'bn')`), `বিকাশ`, `নগদ`, the exact trust line, `/pro?plan=pro-7&from=export`, and `https://wa.me/8801981505761`; output does NOT match `/job|visa|guarantee|চাকরি পাবেন|ভিসা পাবেন/i` outside the trust line.
- [ ] **Step 2: Run** `npx vitest run src/components/ExportReady.test.tsx` — expect FAIL (module missing).
- [ ] **Step 3: Implement `ExportReady`** following `ProGate.tsx` (shell, Escape-to-close, focus). Content: title `আপনার CV তৈরি!`; primary full-width link button "ওয়াটারমার্ক ছাড়া ক্লিন PDF — ৳৪৯ (৭ দিন)" to `/pro?plan=pro-7&from=export`; line "বিকাশ / নগদে পেমেন্ট"; trust line; secondary "ফ্রি ভার্সন রাখুন" (calls `onClose`); WhatsApp help link using `SUPPORT_WHATSAPP`, tracked with `track('cta_whatsapp_click', { where: 'export_ready' })`. Primary button sits in a sticky bottom bar (`sticky bottom-0`), body text `text-lg`.
- [ ] **Step 4: Run the test** — expect PASS.
- [ ] **Step 5: Commit** `feat: add export-ready sheet`

### Task 2: Offer helper and Builder wiring

**Files:**
- Create: `src/lib/exportOffer.ts`
- Test: `src/lib/exportOffer.test.ts`
- Modify: `src/pages/Builder.tsx` (`printNow` ~683, `downloadWord` ~603, gate render ~1163)

**Interfaces:**
- Consumes: `ExportReady` from Task 1; `track` from `src/lib/track.ts`.
- Produces: `export function offerAfterExport(o: { pro: boolean; clientId: string | null | undefined; format: string; alreadyOpen: boolean; track: (name: string, meta?: Record<string, string | number>) => void; open: () => void }): boolean` — returns true when it opened the sheet.

- [ ] **Step 1: Write failing tests**: (a) free, no client, not open → calls `track('paywall_view', { source: 'export', format })` exactly once, `open` once, returns true; (b) `pro: true` → no track, no open, false; (c) `clientId: 'c1'` → none; (d) `alreadyOpen: true` → none (double-tap).
- [ ] **Step 2: Run** `npx vitest run src/lib/exportOffer.test.ts` — expect FAIL.
- [ ] **Step 3: Implement `offerAfterExport`** as specified.
- [ ] **Step 4: Run tests** — expect PASS.
- [ ] **Step 5: Wire `Builder.tsx`**: add `const [ready, setReady] = useState(false)`; call `offerAfterExport({ pro, clientId, format, alreadyOpen: ready, track, open: () => setReady(true) })` (a) in `printNow` after the print starts (format `'pdf'`; keep existing `cv_export`), (b) in `downloadWord` right after its `cv_export` (format `'docx'`/`'docx_ats'`, inside the `try` so a failed build never offers). Render `{ready && <ExportReady onClose={() => setReady(false)} />}` beside the `gate` block. `clientPrint` already reaches `printNow` with a `clientId`, so partners are skipped by the helper.
- [ ] **Step 6: Run** `npm test` and `npm run build` — expect PASS.
- [ ] **Step 7: Commit** `feat: offer clean PDF after every free export`

### Task 3: payment_start event and plan preselect

**Files:**
- Create: `src/lib/paymentStart.ts`
- Test: `src/lib/paymentStart.test.ts`
- Modify: `src/pages/Pro.tsx` (~137), `src/components/Checkout.tsx` (~149)

**Interfaces:**
- Produces: `export function goToPayment(url: string, product: string, deps?: { track?: typeof track; assign?: (u: string) => void }): void` — fires `track('payment_start', { product })` once, then `assign(url)` (default `window.location.assign`).

- [ ] **Step 1: Write failing tests**: tracks `payment_start` with `{ product: 'pro-7' }` once, then calls `assign` with the URL (assert call order).
- [ ] **Step 2: Run** `npx vitest run src/lib/paymentStart.test.ts` — expect FAIL.
- [ ] **Step 3: Implement `goToPayment`.**
- [ ] **Step 4: Run tests** — expect PASS.
- [ ] **Step 5: Replace both `window.location.href = d.paymentUrl` redirects** (Pro.tsx buy, Checkout.tsx submit) with `goToPayment(...)`. In `Pro.tsx`, read `plan` from `window.location.search`; if it is a valid `PlanId`, use it instead of `'pro-30'` for the `featured` highlight (card ring/primary button).
- [ ] **Step 6: Run** `npm test` and `npm run lint` — expect PASS.
- [ ] **Step 7: Commit** `feat: payment_start event and pro-7 preselect`

### Task 4: Verify

- [ ] **Step 1:** `npm test && npm run build && npm run lint` — all pass.
- [ ] **Step 2:** `npm run dev`, open `/builder?utm_source=fb&utm_medium=cpc&utm_campaign=test` at 375px width: build a CV, tap Download PDF → sheet appears; tap Word → sheet appears once; "ফ্রি ভার্সন রাখুন" closes it; no horizontal scroll; sticky button visible.
- [ ] **Step 3:** Check network calls to `/api/t`: one `cv_export` and one `paywall_view` per export, UTM present on the session's first hit; `/pro?plan=pro-7` highlights the 7-day pass.
- [ ] **Step 4:** Report results and the manual step left for the owner: test on a real phone after deploy and read /admin Analytics (`paywall_view` ≈ `cv_export`).
