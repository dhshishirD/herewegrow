# Export → "আপনার CV তৈরি!" sheet — Design (short)

Date: 2026-11-15 · Owner: Daloyar Hassan Shishir · Status: approved in chat ("go")

## Why
Admin data to 15 Nov: 18 visitors exported 64 CVs, only 3 saw any paywall, 2 clicked checkout, 0 paid. Free designs download straight away with only a small watermark; `ProGate` (the only `paywall_view`) appears only when a free user picks a Pro design.

## Goals
- Every export (PDF, Word, ATS Word, partner export excluded) ends on a sheet that offers the clean PDF without watermark with the 7-day pass at ৳49.
- `paywall_view` count ≈ `cv_export` visitor count in /admin.
- The offer works on a phone: large Bangla text, sticky primary button, no horizontal scroll.

## Non-goals / anti-goals
- No blocking of the free download; the free file still downloads first. (Anti-goal: users feel the free tool turned into a trap.)
- No promises of jobs, visas or guarantees. Trust line: "আমরা এজেন্ট নই; ভিসা বা চাকরি বিক্রি করি না".
- No guest checkout in this change (login stays; measure first).
- No price shown before the free start (price appears only on the post-export sheet).

## Approaches
1. **Sheet after the free download starts (chosen).** Keeps the free promise, every export meets the offer.
2. Gate before the download. Converts more, but risks losing the many free users and trust.
3. Guest checkout now. Bigger payment/claim change; leak is "never sees the offer", not login; deferred.

## Design
- New `ExportReady` component (reuses the `ProGate` shell/pattern). Primary: clean PDF with the 7-day pass ৳49 → `/pro` with the 7-day plan preselected and a return path to the builder. Secondary: keep the free version (closes), WhatsApp help (`SUPPORT_WHATSAPP`, tracked with `cta_whatsapp_click`). Payment line: bKash / Nagad.
- Builder: after `printNow` / `downloadWord` complete for a non-Pro user, open the sheet and fire `paywall_view` once per export (meta: `source: 'export'`, `format`). Pro users never see it. The existing `ProGate` path stays as is.
- Events: `cv_export` unchanged; `paywall_view` as above; `checkout_click` already fires in Pro; add `payment_start` just before redirect to the payment URL (Pro and template checkout); `purchase` already written server-side with a dedupe key, nothing to add. UTM travels with the first hit of the session, unchanged.
- Admin funnel: include `payment_start` if the funnel list is a simple name list.

## Left to the builder
Exact Bangla copy polish, pass return path wiring, test layout at 375px.
