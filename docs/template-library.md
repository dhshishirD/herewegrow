# Template library (259 templates)

The Templates page now lists the original 39 ("core") plus 200 library templates.

- Data: `shared/templatesLibrary.ts` (generated from the library manifest). Core list: `shared/templates.ts`.
- Single price: `SINGLE_TEMPLATE_PRICE = 29` in `shared/templates.ts`. Pack prices are in `shared/catalog.ts` (`LIB_PACKS`, `sectorPack`, `pack-best-40`).
- Best 40 and the four sector packs are pinned to the core 39 (their zip files hold exactly those). Library packs are `pack-lib-<category>`.
- Previews: `public/templates/<id>/thumb.webp` and `page-1.webp` (first page only, `shown: 1`).
- Tiers, variants and retired templates live in `shared/templateTiers.ts` (decided 12 Nov 2026): 40 tier A, 108 listed cards, 92 variants (options under a lead, canonical to the lead, not separate cards), 39 retired (page answers 301, file and old orders untouched). Run `scripts/retire-check.sql` in the D1 console before adding to `RETIRED`.
- Indexing: the 39 core templates stay indexed. Library templates are indexed only when tier A and not a variant (`shouldIndex`); B follows in wave 2 by adding ids to `TIER_A`. Retired templates have no page and are not in the sitemap.
- Until `/templates/category/<slug>` pages exist, retired pages redirect to `/templates`; set `CATEGORY_PAGES_LIVE = true` in `shared/templateTiers.ts` then.

## Before this goes live: upload the private files
The Word files and pack zips go to the private R2 bucket (not this repo):

    npx wrangler login
    scripts/upload-library-r2.sh /path/to/hwg-r2-upload

Keys are `<id>.docx` and `pack-lib-<category>.zip`. Until they are uploaded, buying a library template shows the "file not available" message.

## The 20 new Designed CVs (13 Nov 2026)
- Data: `shared/templatesNew.ts` (one profession each, tier A, listed, indexed, shown first, "New" badge for 30 days from `added`).
- Files in R2 (bucket root): `<id>.docx` (Designed), `hwg-cv-ats-<profession>-cv.docx` (free ATS twin) and `HWG_How_To_Use_CV_Templates.pdf`. A purchase delivers all three: the product's `files` list holds the bonus files, and a template counts as one Pro download however many files it has.
- The Gulf CV has its own category chip (`gulf`). Other new templates sit in the closest existing category. Packs (Best 40, Full library) are unchanged for now.
