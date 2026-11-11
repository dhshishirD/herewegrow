-- Check before the 39 retired templates go live (Cloudflare -> D1 -> herewegrow -> Console).
-- Retiring only removes the page and card (301 redirect). It never touches the Word file or an old order's download.
-- If a row below shows sales > 0, do NOT retire it: move it to VARIANT_OF in shared/templateTiers.ts instead.
-- Times are Unix milliseconds. Run each statement on its own.

-- 1) Paid single-template orders for the 39 (any sale blocks retirement)
SELECT substr(product_id, 5) AS template, COUNT(*) AS paid_orders
FROM orders
WHERE status = 'paid' AND product_id IN (
  'tpl-hwg-cv-job-biodata-driver-005',
  'tpl-hwg-cv-fresher-fresher-s-011',
  'tpl-hwg-cv-professional-supervisor-044',
  'tpl-hwg-cv-modern-classic-015',
  'tpl-hwg-cv-fresher-fresher-s-001',
  'tpl-hwg-cv-europass-europass-017',
  'tpl-hwg-cv-nurse-doctor-005',
  'tpl-hwg-cv-modern-100-052',
  'tpl-hwg-cv-europass-europass-022',
  'tpl-hwg-cv-job-biodata-driver-004',
  'tpl-hwg-cv-fresher-fresher-s-008',
  'tpl-hwg-cv-europass-europass-024',
  'tpl-hwg-cv-europass-europass-021',
  'tpl-hwg-cv-job-biodata-chef-002',
  'tpl-hwg-cv-modern-100-050',
  'tpl-hwg-cv-europass-europass-019',
  'tpl-hwg-cv-professional-manager-or-cashier-033',
  'tpl-hwg-cv-professional-senior-executive-040',
  'tpl-hwg-cv-europass-europass-004',
  'tpl-hwg-cv-europass-europass-026',
  'tpl-hwg-cv-other-countrywise-003',
  'tpl-hwg-cv-modern-100-053',
  'tpl-hwg-cv-europass-europass-007',
  'tpl-hwg-cv-europass-europass-012',
  'tpl-hwg-cv-it-automation-enginee-002',
  'tpl-hwg-cv-job-biodata-chef-001',
  'tpl-hwg-cv-nurse-doctor-004',
  'tpl-hwg-cv-modern-classic-006',
  'tpl-hwg-cv-professional-ngo-034',
  'tpl-hwg-cv-professional-consultant-027',
  'tpl-hwg-cv-professional-engineering-010',
  'tpl-hwg-cv-professional-manager-or-cashier-032',
  'tpl-hwg-cv-professional-senior-executive-039',
  'tpl-hwg-cv-professional-electrical-enginee-003',
  'tpl-hwg-cv-europass-europass-008',
  'tpl-hwg-cv-modern-classic-028',
  'tpl-hwg-cv-modern-classic-045',
  'tpl-hwg-cv-modern-100-074',
  'tpl-hwg-cv-modern-modern-001'
)
GROUP BY product_id
ORDER BY paid_orders DESC;

-- 2) Views of the template page, all time (shows which of the 39 still get visitors)
SELECT json_extract(meta, '$.id') AS template, COUNT(*) AS views
FROM events
WHERE type = 'event' AND name = 'view_template' AND json_valid(meta) AND json_extract(meta, '$.id') IN (
  'hwg-cv-job-biodata-driver-005',
  'hwg-cv-fresher-fresher-s-011',
  'hwg-cv-professional-supervisor-044',
  'hwg-cv-modern-classic-015',
  'hwg-cv-fresher-fresher-s-001',
  'hwg-cv-europass-europass-017',
  'hwg-cv-nurse-doctor-005',
  'hwg-cv-modern-100-052',
  'hwg-cv-europass-europass-022',
  'hwg-cv-job-biodata-driver-004',
  'hwg-cv-fresher-fresher-s-008',
  'hwg-cv-europass-europass-024',
  'hwg-cv-europass-europass-021',
  'hwg-cv-job-biodata-chef-002',
  'hwg-cv-modern-100-050',
  'hwg-cv-europass-europass-019',
  'hwg-cv-professional-manager-or-cashier-033',
  'hwg-cv-professional-senior-executive-040',
  'hwg-cv-europass-europass-004',
  'hwg-cv-europass-europass-026',
  'hwg-cv-other-countrywise-003',
  'hwg-cv-modern-100-053',
  'hwg-cv-europass-europass-007',
  'hwg-cv-europass-europass-012',
  'hwg-cv-it-automation-enginee-002',
  'hwg-cv-job-biodata-chef-001',
  'hwg-cv-nurse-doctor-004',
  'hwg-cv-modern-classic-006',
  'hwg-cv-professional-ngo-034',
  'hwg-cv-professional-consultant-027',
  'hwg-cv-professional-engineering-010',
  'hwg-cv-professional-manager-or-cashier-032',
  'hwg-cv-professional-senior-executive-039',
  'hwg-cv-professional-electrical-enginee-003',
  'hwg-cv-europass-europass-008',
  'hwg-cv-modern-classic-028',
  'hwg-cv-modern-classic-045',
  'hwg-cv-modern-100-074',
  'hwg-cv-modern-modern-001'
)
GROUP BY 1
ORDER BY views DESC;
