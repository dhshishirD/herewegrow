import type { SmmOrder, UserWallet, SmmService } from '../types';

const WALLET_KEY = 'herewegrow_user_wallet_v1';
const ORDERS_KEY = 'herewegrow_user_orders_v1';

export const getLocalWallet = (): UserWallet => {
  try {
    const saved = localStorage.getItem(WALLET_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return {
    balanceBDT: 500, // Demo trial balance for instant testing
    balanceUSD: 4.10,
    totalSpentBDT: 0,
    totalSpentUSD: 0,
    currencyPreference: 'BDT',
    affiliateCode: 'HWG-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
    affiliateEarningsBDT: 0,
    referralsCount: 0
  };
};

export const saveLocalWallet = (wallet: UserWallet): void => {
  try {
    localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
  } catch (e) {
    console.error(e);
  }
};

export const getLocalOrders = (): SmmOrder[] => {
  try {
    const saved = localStorage.getItem(ORDERS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  // Default demo orders to showcase UI immediately
  return [
    {
      id: 'ORD-98241',
      serviceId: 'fb-001',
      serviceName: 'Facebook Page Likes & Followers [100% BD Bengali Real Targeted]',
      platform: 'facebook',
      link: 'https://facebook.com/bd.fashion.store',
      quantity: 1000,
      chargeBDT: 320,
      chargeUSD: 2.65,
      currency: 'BDT',
      status: 'completed',
      startCount: 1420,
      currentCount: 2420,
      remains: 0,
      createdAt: '2026-09-22 14:30',
      refillEligible: true
    },
    {
      id: 'ORD-98295',
      serviceId: 'yt-001',
      serviceName: 'YouTube Monetization Watch Hours [4000 Hours Package or Custom]',
      platform: 'youtube',
      link: 'https://youtube.com/watch?v=sample_video',
      quantity: 500,
      chargeBDT: 775,
      chargeUSD: 6.40,
      currency: 'BDT',
      status: 'in_progress',
      startCount: 85,
      currentCount: 380,
      remains: 205,
      createdAt: '2026-09-23 09:15',
      refillEligible: true
    }
  ];
};

export const saveLocalOrders = (orders: SmmOrder[]): void => {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error(e);
  }
};

export const createOrder = (
  service: SmmService,
  link: string,
  quantity: number,
  currency: 'BDT' | 'USD'
): { success: boolean; message: string; order?: SmmOrder } => {
  const wallet = getLocalWallet();
  const rate = currency === 'BDT' ? service.ratePer1kBDT : service.ratePer1kUSD;
  const totalCost = (quantity / 1000) * rate;

  if (currency === 'BDT' && wallet.balanceBDT < totalCost) {
    return {
      success: false,
      message: `Insufficient bKash/BDT Balance! Required: ৳${totalCost.toFixed(2)}, Available: ৳${wallet.balanceBDT.toFixed(2)}. Please Top-up your wallet.`
    };
  }

  if (currency === 'USD' && wallet.balanceUSD < totalCost) {
    return {
      success: false,
      message: `Insufficient USD Balance! Required: $${totalCost.toFixed(2)}, Available: $${wallet.balanceUSD.toFixed(2)}. Please Top-up your wallet.`
    };
  }

  // Deduct balance
  if (currency === 'BDT') {
    wallet.balanceBDT -= totalCost;
    wallet.totalSpentBDT += totalCost;
  } else {
    wallet.balanceUSD -= totalCost;
    wallet.totalSpentUSD += totalCost;
  }
  saveLocalWallet(wallet);

  const newOrder: SmmOrder = {
    id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    serviceId: service.id,
    serviceName: service.name,
    platform: service.platform,
    link,
    quantity,
    chargeBDT: currency === 'BDT' ? totalCost : totalCost * 122,
    chargeUSD: currency === 'USD' ? totalCost : totalCost / 122,
    currency,
    status: 'in_progress',
    startCount: Math.floor(100 + Math.random() * 1500),
    currentCount: Math.floor(100 + Math.random() * 1500),
    remains: quantity,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    refillEligible: service.refillDays > 0
  };

  const currentOrders = getLocalOrders();
  saveLocalOrders([newOrder, ...currentOrders]);

  return {
    success: true,
    message: `Order #${newOrder.id} successfully created! Automated delivery has started.`,
    order: newOrder
  };
};

export const triggerRefill = (orderId: string): { success: boolean; message: string } => {
  const orders = getLocalOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return { success: false, message: 'Order not found' };
  
  order.lastRefillDate = new Date().toISOString().replace('T', ' ').substring(0, 16);
  saveLocalOrders(orders);
  return {
    success: true,
    message: `Refill request submitted to server for Order #${orderId}! Replacement delivery in progress.`
  };
};

export const depositFunds = (
  _method: 'bkash' | 'nagad' | 'binance',
  amount: number,
  currency: 'BDT' | 'USD'
): UserWallet => {
  const wallet = getLocalWallet();
  if (currency === 'BDT') {
    wallet.balanceBDT += amount;
    wallet.balanceUSD += amount / 122;
  } else {
    wallet.balanceUSD += amount;
    wallet.balanceBDT += amount * 122;
  }
  saveLocalWallet(wallet);
  return wallet;
};

// ==========================================
// VIRAL TOOLS CALCULATION ALGORITHMS
// ==========================================

// 1. Unicode Font Styling Engine
export const convertToFancyFonts = (text: string): { name: string; text: string }[] => {
  if (!text) text = 'Your Aesthetic Bio';

  const fontMaps: Record<string, string> = {
    'Serif Bold': '𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗',
    'Sans Bold': '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵',
    'Cursive / Script': '𝒜𝐵𝒞𝒟𝐸𝐹𝒢𝐻𝐼𝒥𝒦𝐿𝑀𝒩𝒪𝒫𝒬𝑅𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗',
    'Gothic / Fraktur': '𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗',
    'Double-Struck': '𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡',
    'Monospace Code': '𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝔪𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿',
    'Bubble Circled': 'ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ⓪①②③④⑤⑥⑦⑧⑨'
  };

  const normalChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  return Object.entries(fontMaps).map(([styleName, mappedChars]) => {
    const glyphs = Array.from(mappedChars);
    let result = '';
    for (const char of text) {
      const idx = normalChars.indexOf(char);
      if (idx !== -1 && glyphs[idx]) {
        result += glyphs[idx];
      } else {
        result += char;
      }
    }
    return { name: styleName, text: result };
  });
};

// 2. YouTube Tag Extractor Logic
export const extractMockYouTubeTags = (url: string): { title: string; tags: string[]; seoScore: number; characterCount: number } => {
  const cleanUrl = url.trim().toLowerCase();
  
  let detectedNiche = 'tech';
  if (cleanUrl.includes('vlog') || cleanUrl.includes('bangladesh') || cleanUrl.includes('tour')) detectedNiche = 'vlog';
  if (cleanUrl.includes('music') || cleanUrl.includes('song') || cleanUrl.includes('audio')) detectedNiche = 'music';
  if (cleanUrl.includes('gaming') || cleanUrl.includes('game') || cleanUrl.includes('pubg')) detectedNiche = 'gaming';
  if (cleanUrl.includes('recipe') || cleanUrl.includes('food') || cleanUrl.includes('kitchen')) detectedNiche = 'food';

  const nicheTags: Record<string, string[]> = {
    vlog: ['bangladesh vlog', 'dhaka city tour', 'daily life vlog', 'bangla lifestyle', 'travel bangladesh', 'street food dhaka', 'village life', 'viral vlog 2026', 'trending bangla'],
    music: ['bangla new song', 'romantic acoustic', 'trending audio reels', 'official music video', 'lofi bangla', 'studio session', 'hit song 2026', 'relaxing vibe'],
    gaming: ['gameplay bangla', 'pubg mobile bd', 'free fire gameplay', 'pro tips and tricks', 'pc gaming bd', 'live stream highlights', 'best moments', 'gaming setup'],
    food: ['bangla recipe', 'street food review', 'cooking tutorial', 'easy dinner ideas', 'traditional bangla khana', 'foodie dhaka', 'restaurant review', 'quick snack'],
    tech: ['tech review bangla', 'best smartphone 2026', 'gadget unboxing', 'ai tools tutorial', 'online income bd', 'freelancing tips', 'software review', 'tech guide']
  };

  const tags = nicheTags[detectedNiche] || nicheTags.tech;
  const characterCount = tags.join(', ').length;
  const seoScore = Math.min(96, Math.floor(78 + Math.random() * 18));

  return {
    title: 'Extracted Video Metadata from: ' + (url.length > 35 ? url.substring(0, 35) + '...' : url),
    tags,
    seoScore,
    characterCount
  };
};

// 3. Social Media Engagement Rate Calculator
export const calculateEngagementRate = (
  followers: number,
  avgLikes: number,
  avgComments: number,
  avgShares: number = 0
): {
  rate: number;
  rating: 'Poor' | 'Average' | 'Good' | 'Viral Tier';
  scoreColor: string;
  recommendation: string;
} => {
  if (!followers || followers <= 0) return { rate: 0, rating: 'Poor', scoreColor: 'text-rose-400', recommendation: 'Enter valid followers count.' };

  const totalInteractions = avgLikes + avgComments + avgShares;
  const rate = Number(((totalInteractions / followers) * 100).toFixed(2));

  if (rate >= 4.5) {
    return {
      rate,
      rating: 'Viral Tier',
      scoreColor: 'text-emerald-400',
      recommendation: 'Exceptional Engagement! Your audience is hyper-active. Ideal for top-tier brand sponsorships.'
    };
  } else if (rate >= 2.5) {
    return {
      rate,
      rating: 'Good',
      scoreColor: 'text-cyan-400',
      recommendation: 'Healthy engagement rate. Boosting post reactions and video views will push your content to Explore feeds.'
    };
  } else if (rate >= 1.2) {
    return {
      rate,
      rating: 'Average',
      scoreColor: 'text-amber-400',
      recommendation: 'Standard industry average. Consider injecting initial high-retention views and custom comments to double your ER%.'
    };
  } else {
    return {
      rate,
      rating: 'Poor',
      scoreColor: 'text-rose-400',
      recommendation: 'Low engagement ratio. Your posts are not reaching your followers. Immediate engagement boost recommended.'
    };
  }
};

// 4. YouTube Earnings & Monetization Calculator
export const calculateYouTubeEarnings = (
  dailyViews: number,
  cpmRate: number = 2.50
): {
  dailyUSD: number;
  monthlyUSD: number;
  yearlyUSD: number;
  dailyBDT: number;
  monthlyBDT: number;
  yearlyBDT: number;
} => {
  const dailyGross = (dailyViews / 1000) * cpmRate * 0.55;
  const monthlyGross = dailyGross * 30;
  const yearlyGross = dailyGross * 365;
  const BDT_RATE = 122;

  return {
    dailyUSD: Number(dailyGross.toFixed(2)),
    monthlyUSD: Number(monthlyGross.toFixed(2)),
    yearlyUSD: Number(yearlyGross.toFixed(2)),
    dailyBDT: Number((dailyGross * BDT_RATE).toFixed(0)),
    monthlyBDT: Number((monthlyGross * BDT_RATE).toFixed(0)),
    yearlyBDT: Number((yearlyGross * BDT_RATE).toFixed(0))
  };
};

// 5. AI Viral Hashtags Generator
export const generateViralHashtags = (
  keyword: string,
  platform: 'tiktok' | 'instagram' | 'youtube' | 'facebook'
): { highReach: string[]; mediumCompetition: string[]; viralNiche: string[] } => {
  const cleanKey = keyword.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '');

  return {
    highReach: [
      `#${cleanKey}`,
      `#${cleanKey}viral`,
      `#${cleanKey}trending`,
      `#viral${platform}`,
      `#explorepage`,
      `#trendingnow`
    ],
    mediumCompetition: [
      `#${cleanKey}tips`,
      `#${cleanKey}content`,
      `#${cleanKey}daily`,
      `#${cleanKey}creator`,
      `#${cleanKey}growth`,
      `#${cleanKey}community`
    ],
    viralNiche: [
      `#${cleanKey}bd`,
      `#${cleanKey}hacks`,
      `#${cleanKey}secrets`,
      `#best${cleanKey}2026`,
      `#${cleanKey}monetization`
    ]
  };
};
