# HereWeGrow

CV writing, CV templates and free job tools for job seekers in Bangladesh: [herewegrow.pro](https://herewegrow.pro)

- **CV services:** CV review, CV writing (fresher, experienced, executive) and marriage biodata
- **Template packs:** editable Word + PDF CV and biodata templates
- **Free tools:** CV checker (ATS score and fixes) and a photo/signature resizer for Teletalk government job forms
- **Payments:** bKash, Nagad and Rocket through the hosted UddoktaPay (Paymently) gateway
- Bangla and English throughout; Bangla is the default

## Stack

React 19 + TypeScript + Vite + Tailwind CSS v4, deployed on Cloudflare Pages with Pages Functions for the payment API.

```
shared/catalog.ts      products and prices: one list used by the site and the server
server/paymently.ts    server-only gateway helper (reads the API key from the environment)
functions/api/         /api/checkout and /api/verify (Cloudflare Pages Functions)
src/pages/             home, services, templates, tools, payment result, policies
src/lib/               language, routing, SEO, CV analysis, PDF text reading
```

To change a price or add a product, edit `shared/catalog.ts`. The server always charges the catalogue price.

## Payment setup (required)

The payment API key is **never** stored in code. Set it in Cloudflare:

1. Cloudflare dashboard → Workers & Pages → herewegrow → Settings → Variables and secrets
2. Add a **secret** named `PAYMENT_API_KEY` with your Paymently/UddoktaPay API key (Production and Preview)
3. Optional: `PAYMENT_API_BASE` if the panel URL changes (default `https://herewegrow.paymently.io/api`)
4. Redeploy

Payment flow: the browser calls `/api/checkout` with a product ID and contact details → the server sets the amount from the catalogue and creates the gateway checkout → after paying, the buyer returns to `/payment/success`, which calls `/api/verify` to confirm the payment and checks the amount against the catalogue.

## Development

```bash
npm install
npm run dev          # site only, at http://localhost:5173

# site + payment functions, at http://localhost:8788
npm run build
npx wrangler pages dev dist --binding PAYMENT_API_KEY=your-test-key
```

`npm run lint` runs oxlint; `npm run build` type-checks and builds to `dist/`.

## Deploy

Cloudflare Pages, connected to this repo. Build command `npm run build`, output directory `dist`.
