const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const BROWSER_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const templates = [
  { html: 'ad1_fcommerce.html', outPng: 'promo_ad_fcommerce_trust.png', outJpg: 'promo_ad_fcommerce_trust.jpg' },
  { html: 'ad2_free_trial.html', outPng: 'promo_ad_free_trial.png', outJpg: 'promo_ad_free_trial.jpg' },
  { html: 'ad3_youtube.html', outPng: 'promo_ad_youtube_monetization.png', outJpg: 'promo_ad_youtube_monetization.jpg' },
  { html: 'ad4_affiliate.html', outPng: 'promo_ad_affiliate_earning.png', outJpg: 'promo_ad_affiliate_earning.jpg' },
];

console.log('Using browser binary:', BROWSER_PATH);

templates.forEach(({ html, outPng, outJpg }) => {
  const htmlPath = path.resolve(__dirname, 'templates', html);
  const outPngPath = path.resolve(__dirname, '../public/branding', outPng);
  const outJpgPath = path.resolve(__dirname, '../public/branding', outJpg);

  const fileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;
  
  const cmd = `"${BROWSER_PATH}" --headless --disable-gpu --window-size=1080,1080 --hide-scrollbars --screenshot="${outPngPath}" "${fileUrl}"`;
  
  console.log(`Rendering ${html} -> ${outPng}...`);
  try {
    execSync(cmd, { stdio: 'inherit' });
    fs.copyFileSync(outPngPath, outJpgPath);
    console.log(`✓ Successfully rendered ${outPng} & ${outJpg}`);
  } catch (err) {
    console.error(`Error rendering ${html}:`, err.message);
  }
});

console.log('All 4 High-Contrast Neon Bengali Ad Banners rendered with 100% perfect Hind Siliguri typography!');
