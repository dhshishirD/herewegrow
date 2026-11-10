# Template library (239 templates)

The Templates page now lists the original 39 ("core") plus 200 library templates.

- Data: `shared/templatesLibrary.ts` (generated from the library manifest). Core list: `shared/templates.ts`.
- Single price: `SINGLE_TEMPLATE_PRICE = 29` in `shared/templates.ts`. Pack prices are in `shared/catalog.ts` (`LIB_PACKS`, `sectorPack`, `pack-best-40`).
- Best 40 and the four sector packs are pinned to the core 39 (their zip files hold exactly those). Library packs are `pack-lib-<category>`.
- Previews: `public/templates/<id>/thumb.webp` and `page-1.webp` (first page only, `shown: 1`).
- Library template pages ship `noindex,follow` and stay out of the sitemap. Flip `INDEX_LIBRARY_PAGES` in `scripts/seo.ts` after Search Console shows the category pages are indexed.

## Before this goes live: upload the private files
The Word files and pack zips go to the private R2 bucket (not this repo):

    npx wrangler login
    scripts/upload-library-r2.sh /path/to/hwg-r2-upload

Keys are `<id>.docx` and `pack-lib-<category>.zip`. Until they are uploaded, buying a library template shows the "file not available" message.
