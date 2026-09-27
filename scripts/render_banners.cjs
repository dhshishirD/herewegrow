const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const BROWSER_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const logoPath = path.resolve(__dirname, '../public/branding/herewegrow_logo_friendly_h_arrow.jpg');
const logoBase64 = fs.readFileSync(logoPath).toString('base64');
const logoDataUri = `data:image/jpeg;base64,${logoBase64}`;

const templates = [
  { html: 'ad1_fcommerce.html', outPng: 'promo_ad_fcommerce_trust.png', outJpg: 'promo_ad_fcommerce_trust.jpg' },
  { html: 'ad2_free_trial.html', outPng: 'promo_ad_free_trial.png', outJpg: 'promo_ad_free_trial.jpg' },
  { html: 'ad3_youtube.html', outPng: 'promo_ad_youtube_monetization.png', outJpg: 'promo_ad_youtube_monetization.jpg' },
  { html: 'ad4_affiliate.html', outPng: 'promo_ad_affiliate_earning.png', outJpg: 'promo_ad_affiliate_earning.jpg' },
];

console.log('Using browser binary:', BROWSER_PATH);

templates.forEach(({ html, outPng, outJpg }) => {
  const htmlPath = path.resolve(__dirname, 'templates', html);
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');

  // Replace any image src with the full base64 data URI of the confirmed master logo
  htmlContent = htmlContent.replace(/<img src="[^"]+" alt="Logo">/g, `<img src="${logoDataUri}" alt="HereWeGrow Logo">`);

  // Write to temporary HTML file
  const tempHtmlPath = path.resolve(__dirname, 'templates', `_temp_${html}`);
  fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');

  const outPngPath = path.resolve(__dirname, '../public/branding', outPng);
  const outJpgPath = path.resolve(__dirname, '../public/branding', outJpg);

  const fileUrl = `file:///${tempHtmlPath.replace(/\\/g, '/')}`;
  
  const cmd = `"${BROWSER_PATH}" --headless --disable-gpu --window-size=1080,1080 --hide-scrollbars --screenshot="${outPngPath}" "${fileUrl}"`;
  
  console.log(`Rendering ${html} with confirmed master logo -> ${outPng}...`);
  try {
    execSync(cmd, { stdio: 'inherit' });
    fs.copyFileSync(outPngPath, outJpgPath);
    console.log(`✓ Successfully rendered ${outPng} & ${outJpg}`);
  } catch (err) {
    console.error(`Error rendering ${html}:`, err.message);
  } finally {
    if (fs.existsSync(tempHtmlPath)) {
      fs.unlinkSync(tempHtmlPath);
    }
  }
});

console.log('All 4 High-Contrast Neon Bengali Ad Banners rendered with confirmed master logo & Hind Siliguri typography!');
