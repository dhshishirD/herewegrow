const fs = require('fs');
const path = require('path');
const https = require('https');

// Helper to load .env manually without external packages
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...rest] = trimmed.split('=');
        const val = rest.join('=').replace(/^["']|["']$/g, '').trim();
        process.env[key.trim()] = val;
      }
    }
  }
}

loadEnv();

const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID;
const PAGE_ID = process.env.META_PAGE_ID;

// Meta API HTTP Helper
function metaRequest(endpoint, method = 'GET', postData = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://graph.facebook.com/v19.0/${endpoint}`);
    if (method === 'GET' && ACCESS_TOKEN) {
      url.searchParams.append('access_token', ACCESS_TOKEN);
    }

    const options = {
      method,
      headers: postData ? {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      } : {
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            reject(json.error);
          } else {
            resolve(json);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

// Multipart Form-Data Helper for Image Uploads
function uploadAdImage(adAccountId, imagePath) {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const filename = path.basename(imagePath);
    const fileData = fs.readFileSync(imagePath);

    const postDataHeader = Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="filename"; filename="${filename}"\r\n` +
      `Content-Type: image/png\r\n\r\n`
    );
    const postDataFooter = Buffer.from(`\r\n--${boundary}--\r\n`);
    const payload = Buffer.concat([postDataHeader, fileData, postDataFooter]);

    const cleanAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    const url = new URL(`https://graph.facebook.com/v19.0/${cleanAccountId}/adimages?access_token=${ACCESS_TOKEN}`);

    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': payload.length
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            reject(json.error);
          } else {
            const hash = json.images?.[filename]?.hash || Object.values(json.images || {})[0]?.hash;
            resolve(hash);
          }
        } catch (e) {
          reject(new Error(`Image upload failed: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runMetaAdsSetup() {
  console.log('====================================================');
  console.log('🚀 HereWeGrow Automated Meta Ads Launch Engine (v1.0)');
  console.log('====================================================\n');

  if (!ACCESS_TOKEN || ACCESS_TOKEN.includes('YOUR_')) {
    console.error('❌ Missing META_ACCESS_TOKEN in .env file!');
    console.log('\n👉 Please open .env and enter your Meta Access Token.');
    return;
  }

  if (!AD_ACCOUNT_ID || AD_ACCOUNT_ID.includes('YOUR_')) {
    console.error('❌ Missing META_AD_ACCOUNT_ID in .env file!');
    console.log('\n👉 Please open .env and enter your Meta Ad Account ID (e.g. act_123456789).');
    return;
  }

  const cleanAccountId = AD_ACCOUNT_ID.startsWith('act_') ? AD_ACCOUNT_ID : `act_${AD_ACCOUNT_ID}`;

  try {
    // 1. Verify Token & Account
    console.log('🔍 Step 1: Verifying Meta API connection...');
    const me = await metaRequest('me');
    console.log(`✓ Connected to Meta User/App: ${me.name || me.id}`);

    const account = await metaRequest(`${cleanAccountId}?fields=name,account_status,currency,amount_spent`);
    console.log(`✓ Verified Ad Account: "${account.name}" (Status: Active, Currency: ${account.currency})\n`);

    // 2. Upload Ad Creative Images
    console.log('🖼️ Step 2: Uploading 1080x1080 Ad Creatives to Meta Library...');
    const img1Path = path.resolve(__dirname, '../public/branding/promo_ad_fcommerce_trust.png');
    const img2Path = path.resolve(__dirname, '../public/branding/promo_ad_free_trial.png');

    console.log('Uploading Ad 1 (F-Commerce Trust)...');
    const hash1 = await uploadAdImage(cleanAccountId, img1Path);
    console.log(`✓ Ad 1 Image Hash: ${hash1}`);

    console.log('Uploading Ad 2 (Free Speed Trial)...');
    const hash2 = await uploadAdImage(cleanAccountId, img2Path);
    console.log(`✓ Ad 2 Image Hash: ${hash2}\n`);

    // 3. Create Campaign
    console.log('📁 Step 3: Creating Master Traffic Campaign (Draft Mode)...');
    const campaign = await metaRequest(`${cleanAccountId}/campaigns`, 'POST', {
      name: 'HereWeGrow - Traffic & Verified Scale 2026',
      objective: 'OUTCOME_TRAFFIC',
      status: 'PAUSED', // Safe mode
      special_ad_categories: ['NONE']
    });
    console.log(`✓ Campaign Created! ID: ${campaign.id}\n`);

    // 4. Create Ad Set 1 (F-Commerce Page Admins)
    console.log('🎯 Step 4: Creating Ad Set 1 (F-Commerce Shop Owners & Page Admins)...');
    const adset1 = await metaRequest(`${cleanAccountId}/adsets`, 'POST', {
      name: 'AdSet 1 - BD F-Commerce Page Admins ($4/day)',
      campaign_id: campaign.id,
      daily_budget: '50000', // in minor currency units (e.g., 500 BDT or 5.00 USD)
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'LINK_CLICKS',
      bid_strategy: 'LOWEST_COST_WITHOUT_BID_CAP',
      targeting: {
        geo_locations: {
          countries: ['BD']
        },
        age_min: 21,
        age_max: 50,
        publisher_platforms: ['facebook', 'instagram'],
        facebook_positions: ['feed', 'marketplace', 'story'],
        instagram_positions: ['stream', 'story', 'explore']
      },
      status: 'PAUSED'
    });
    console.log(`✓ AdSet 1 Created! ID: ${adset1.id}\n`);

    // 5. Create Ad Creative & Ad
    console.log('🎨 Step 5: Attaching Creative & Copy to AdSet 1...');
    const creative1 = await metaRequest(`${cleanAccountId}/adcreatives`, 'POST', {
      name: 'Creative - F-Commerce Anti-Scam Trust',
      object_story_spec: {
        page_id: PAGE_ID || '122099571759490928',
        link_data: {
          link: 'https://herewegrow.pro/services/facebook-followers',
          message: '🚨 ইনবক্স সেলারদের টাকা দিয়ে ব্লক খেয়েছেন কখনো? আর নয় রিস্ক! ❌\n\nHereWeGrow দিচ্ছে ১০০% পাসওয়ার্ড-লেস ও ভেরিফায়েড ফেসবুক পেজ ফলোয়ার ও রিঅ্যাকশন সার্ভিস।\n\n🛡️ ৩৬৫ দিনের অটো-রিফিল গ্যারান্টি\n⚡ ৪৫ সেকেন্ডে ডেলিভারি শুরু\n🇧🇩 ১-ক্লিকে বিকাশ ও নগদ পেমেন্ট (০% গেটওয়ে ফি)\n\n👉 আপনার বিজনেস পেজের বিশ্বাসযোগ্যতা বাড়ান আজই!',
          name: 'ইনবক্স সেলারদের বাদ দিন — সরাসরি ভেরিফায়েড প্ল্যাটফর্ম 💎',
          description: '100% Non-Drop Guaranteed • 0% Password Required • Instant 45s Start',
          image_hash: hash1,
          call_to_action: {
            type: 'SHOP_NOW',
            value: {
              link: 'https://herewegrow.pro/services/facebook-followers'
            }
          }
        }
      }
    });

    const ad1 = await metaRequest(`${cleanAccountId}/ads`, 'POST', {
      name: 'Ad 1 - F-Commerce Trust Image',
      adset_id: adset1.id,
      creative: { creative_id: creative1.id },
      status: 'PAUSED'
    });
    console.log(`✓ Ad 1 Created! ID: ${ad1.id}\n`);

    console.log('====================================================');
    console.log('🎉 SUCCESS: All Ads Created in PAUSED (Draft) Mode!');
    console.log('====================================================');
    console.log(`👉 Open Ads Manager: https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${cleanAccountId.replace('act_', '')}`);
    console.log('You can now review the campaign with 1 click and hit "Publish" whenever you are ready!\n');

  } catch (err) {
    console.error('\n❌ Meta API Execution Error:', err.message || err);
  }
}

if (require.main === module) {
  runMetaAdsSetup();
}
