# HereWeGrow

CV writing, CV templates and free job tools for job seekers in Bangladesh: [herewegrow.pro](https://herewegrow.pro)

- **CV services:** CV review, CV writing (fresher, experienced, executive) and marriage biodata
- **Template packs:** editable Word + PDF CV and biodata templates
- **Free tools:** CV checker (ATS score and fixes) and a photo/signature resizer for Teletalk government job forms
- **Payments:** bKash, Nagad and Rocket through the hosted UddoktaPay (Paymently) gateway
- Bangla and English throughout; Bangla is the default

## Stack

React 19 + TypeScript + Vite + Tailwind CSS v4, deployed as a Cloudflare Worker (`herewegrow-app`) that serves the built site and handles the payment API.

```
shared/catalog.ts      products and prices: one list used by the site and the server
worker/index.ts        Worker entry: /api/* handled here, everything else served from dist/
server/handlers.ts     /api/checkout and /api/verify
server/paymently.ts    server-only gateway helper (reads the API key from the environment)
src/pages/             home, services, templates, tools, payment result, policies
src/lib/               language, routing, SEO, CV analysis, PDF text reading
```

To change a price or add a product, edit `shared/catalog.ts`. The server always charges the catalogue price.

## Payment setup (required)

The payment API key is **never** stored in code. Set it in Cloudflare:

1. Cloudflare dashboard → Workers & Pages → **herewegrow-app** → Settings → Variables and secrets
2. Add a variable of type **Secret** named `PAYMENT_API_KEY` with your Paymently/UddoktaPay API key
3. Optional: `PAYMENT_API_BASE` if the panel URL changes (default `https://herewegrow.paymently.io/api`)
4. Redeploy (secrets are kept between deploys)

Payment flow: the browser calls `/api/checkout` with a product ID and contact details → the server sets the amount from the catalogue and creates the gateway checkout → after paying, the buyer returns to `/payment/success`, which calls `/api/verify` to confirm the payment and checks the amount against the catalogue.

## Development

```bash
npm install
npm run dev          # site only, at http://localhost:5173

# site + payment API in the Worker runtime, at http://localhost:8787
npm run build
npx wrangler dev --var PAYMENT_API_KEY:your-test-key
```

`npm run lint` runs oxlint; `npm run build` type-checks and builds to `dist/`.

## Blog post performance

Admin → Blog shows how each live post performs (visitors, read rate, CTA clicks, tool starts, orders) with a Keep / Fix hint per post. It needs no migration. The blog page sends `blog_exit` (scroll depth and visible seconds, once per view) and `blog_cta_click` events to `/api/t`; purchases carry the blog post the buyer read last (`meta.post`). Thresholds and hints live in `shared/blogPerformance.ts`; details are in section 16 of `docs/superpowers/specs/2026-11-05-admin-analytics-contact-design.md`.

## Deploy

Cloudflare Workers Builds, connected to this repo: build command `npm run build`, deploy command `npx wrangler deploy`. Every push to `main` deploys.
