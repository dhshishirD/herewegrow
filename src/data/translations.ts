export type Language = 'en' | 'bn';

export interface TranslationDictionary {
  // Navigation
  nav_store: string;
  nav_bundles: string;
  nav_affiliate: string;
  nav_tools: string;
  nav_orders: string;
  nav_api: string;
  nav_deposit: string;
  nav_balance: string;
  nav_badge_popular: string;
  nav_badge_earn: string;
  nav_geo_selector: string;

  // Hero Section
  hero_badge: string;
  hero_title_1: string;
  hero_title_2: string;
  hero_subtitle: string;
  hero_cta_store: string;
  hero_cta_bundles: string;
  hero_cta_tools: string;
  hero_metric_1_title: string;
  hero_metric_1_sub: string;
  hero_metric_2_title: string;
  hero_metric_2_sub: string;
  hero_metric_3_title: string;
  hero_metric_3_sub: string;
  hero_metric_4_title: string;
  hero_metric_4_sub: string;

  // Free Trial Booster
  trial_badge: string;
  trial_title: string;
  trial_subtitle: string;
  trial_input_placeholder: string;
  trial_cta_button: string;
  trial_free_badge: string;
  trial_remaining_quota: string;
  trial_quota_exhausted: string;
  trial_starters_title: string;
  trial_starters_badge: string;
  trial_starters_sub: string;
  trial_starters_order_btn: string;

  // Store & Catalog
  catalog_title: string;
  catalog_subtitle: string;
  catalog_search_placeholder: string;
  catalog_filter_all: string;
  catalog_badge_instant: string;
  catalog_badge_fast: string;
  catalog_badge_guaranteed: string;
  catalog_order_now: string;
  catalog_starting_at: string;
  catalog_per_1k: string;
  catalog_min: string;
  catalog_max: string;
  catalog_details: string;
  catalog_wholesale_terminal: string;

  // Bundles
  bundles_title: string;
  bundles_subtitle: string;
  bundles_save_badge: string;
  bundles_get_now: string;
  bundles_features_included: string;

  // Affiliate
  affiliate_title: string;
  affiliate_subtitle: string;
  affiliate_register_cta: string;
  affiliate_share_link: string;
  affiliate_copy_success: string;
  affiliate_earn_rate: string;
  affiliate_instant_payout: string;

  // Order Tracker
  tracker_title: string;
  tracker_subtitle: string;
  tracker_input_placeholder: string;
  tracker_btn: string;
  tracker_no_orders: string;

  // Wallet
  wallet_title: string;
  wallet_balance_label: string;
  wallet_deposit_btn: string;
  wallet_bkash_auto: string;
  wallet_binance_pay: string;
  wallet_manual_payment: string;

  // Geo Modal
  geo_modal_title: string;
  geo_modal_desc: string;
  geo_detected_badge: string;
  geo_select_country: string;
  geo_select_language: string;
  geo_select_currency: string;
  geo_save_btn: string;

  // Footer
  footer_tagline: string;
  footer_rights: string;
  footer_support_247: string;
  footer_guarantee: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    // Navigation
    nav_store: 'Growth Store',
    nav_bundles: '1-Click Bundles',
    nav_affiliate: 'Earn Money',
    nav_tools: 'Free Creator Tools',
    nav_orders: 'Track Orders',
    nav_api: 'Reseller API',
    nav_deposit: 'Deposit',
    nav_balance: 'Balance',
    nav_badge_popular: 'Popular',
    nav_badge_earn: '15-25%',
    nav_geo_selector: 'Country / Lang',

    // Hero Section
    hero_badge: 'Verified Social Growth Infrastructure • 2026 Engine Active',
    hero_title_1: 'Scale Your Social Authority with',
    hero_title_2: 'Verified Growth & Free Creator Tools',
    hero_subtitle:
      'The all-in-one studio for digital creators and brands. Utilize our 100% Free SEO & Creator Tools to optimize reach, or accelerate your audience with non-drop guaranteed social delivery with instant bKash, Nagad & Crypto.',
    hero_cta_store: 'Explore Growth Catalog',
    hero_cta_bundles: '1-Click Monetization Packs',
    hero_cta_tools: 'Free Creator Tools',
    hero_metric_1_title: 'Instant 15-Min Start',
    hero_metric_1_sub: 'Automated queue API',
    hero_metric_2_title: 'Non-Drop Protected',
    hero_metric_2_sub: 'Auto refill guarantee',
    hero_metric_3_title: 'bKash & Nagad Auto',
    hero_metric_3_sub: 'Instant BDT checkout',
    hero_metric_4_title: '120,000+ Completed',
    hero_metric_4_sub: 'Verified creator orders',

    // Free Trial Booster
    trial_badge: '1-Click Speed Tester • 100% Free',
    trial_title: 'Test Delivery Speed For Free (No Card/Login Required)',
    trial_subtitle:
      'Pick a sample below, paste your public link, and witness instant high-speed delivery in seconds.',
    trial_input_placeholder: 'Paste your public Post / Reel / Video link here...',
    trial_cta_button: 'Send Free Sample Now',
    trial_free_badge: '100% FREE',
    trial_remaining_quota: 'Free samples remaining for your IP:',
    trial_quota_exhausted: 'Free trial quota used. Ready to scale? Check our ultra-cheap starter packages below!',
    trial_starters_title: 'Micro-Tester Packages (Try for ৳2 / $0.02)',
    trial_starters_badge: 'Zero Risk Micro-Orders',
    trial_starters_sub: 'Want to test our premium algorithm at wholesale rates? Start with as low as ৳2 / $0.02.',
    trial_starters_order_btn: 'Order Starter',

    // Store & Catalog
    catalog_title: 'All-Platform Growth Catalog',
    catalog_subtitle: 'Hand-picked, high-retention social signals directly connected to top global wholesale servers.',
    catalog_search_placeholder: 'Search Facebook, Instagram, TikTok, YouTube services...',
    catalog_filter_all: 'All Platforms',
    catalog_badge_instant: 'Instant Start',
    catalog_badge_fast: 'High Speed',
    catalog_badge_guaranteed: 'Non-Drop Refill',
    catalog_order_now: 'Order Now',
    catalog_starting_at: 'Starting at',
    catalog_per_1k: '/ 1,000',
    catalog_min: 'Min',
    catalog_max: 'Max',
    catalog_details: 'View Details & Specs',
    catalog_wholesale_terminal: 'Open Wholesale Quick Terminal',

    // Bundles
    bundles_title: '1-Click Creator Bundles',
    bundles_subtitle: 'Curated all-in-one growth packs crafted to boost your profiles and trigger social algorithms.',
    bundles_save_badge: 'Save up to 40%',
    bundles_get_now: 'Get This Bundle',
    bundles_features_included: 'Everything Included:',

    // Affiliate
    affiliate_title: 'Partner & Earn with HereWeGrow',
    affiliate_subtitle: 'Share your personal referral link and earn 15% to 25% lifetime commission on every deposit and order.',
    affiliate_register_cta: 'Register as Affiliate in 30 Seconds',
    affiliate_share_link: 'Your Affiliate Referral Link:',
    affiliate_copy_success: 'Link Copied to Clipboard!',
    affiliate_earn_rate: '15-25% Lifetime Commissions',
    affiliate_instant_payout: 'Instant Payouts to bKash & Nagad (Min ৳100)',

    // Order Tracker
    tracker_title: 'Real-Time Order & Server Tracker',
    tracker_subtitle: 'Live connection to automated provider queues. Monitor processing, start count, and delivery status.',
    tracker_input_placeholder: 'Enter Order ID (e.g. HWG-ORD-...)',
    tracker_btn: 'Search Order',
    tracker_no_orders: 'No orders found yet. Place your first order from our Growth Store!',

    // Wallet
    wallet_title: 'Account Wallet & Funds',
    wallet_balance_label: 'Current Available Balance:',
    wallet_deposit_btn: 'Add Funds Now',
    wallet_bkash_auto: 'Automatic bKash & Nagad Gateway',
    wallet_binance_pay: 'Binance Pay & Crypto (USDT / BTC)',
    wallet_manual_payment: 'Manual Transaction Verification',

    // Geo Modal
    geo_modal_title: 'Select Region & Language',
    geo_modal_desc: 'Customize your currency, payment options, and language for the best local experience.',
    geo_detected_badge: 'Auto-Detected Location',
    geo_select_country: 'Select Country / Region',
    geo_select_language: 'Select Interface Language',
    geo_select_currency: 'Default Currency',
    geo_save_btn: 'Apply & Save Preferences',

    // Footer
    footer_tagline: 'Empowering creators and brands worldwide with verified social growth tools and instant delivery.',
    footer_rights: 'All rights reserved.',
    footer_support_247: '24/7 Live Support via WhatsApp & Telegram',
    footer_guarantee: '100% Secure & Guaranteed Non-Drop Services',
  },
  bn: {
    // Navigation
    nav_store: 'গ্রোথ স্টোর',
    nav_bundles: '১-ক্লিক বান্ডেল',
    nav_affiliate: 'ইনকাম করুন',
    nav_tools: 'ফ্রি ক্রিয়েটর টুলস',
    nav_orders: 'অর্ডার ট্র্যাকিং',
    nav_api: 'রিসেলার API',
    nav_deposit: 'ডিপোজিট',
    nav_balance: 'ব্যালেন্স',
    nav_badge_popular: 'জনপ্রিয়',
    nav_badge_earn: '১৫-২৫%',
    nav_geo_selector: 'দেশ ও ভাষা',

    // Hero Section
    hero_badge: 'ভেরিফায়েড সোশ্যাল গ্রোথ সার্ভার • ২০২৬ ইঞ্জিন সক্রিয়',
    hero_title_1: 'আপনার সোশ্যাল মিডিয়ার প্রভাব বাড়ান',
    hero_title_2: 'গ্যারান্টিযুক্ত গ্রোথ ও ফ্রি ক্রিয়েটর টুলসে',
    hero_subtitle:
      'ডিজিটাল ক্রিয়েটর ও ব্র্যান্ডের জন্য কমপ্লিট সলিউশন। ১০০% ফ্রি এসইও ও ক্রিয়েটর টুলস ব্যবহার করে রিচ বাড়ান, অথবা নন-ড্রপ গ্যারান্টিযুক্ত সার্ভিসে বিকাশ ও নগদ দিয়ে ইনস্ট্যান্ট ফলোয়ার, ভিউ ও লাইক বাড়িয়ে নিন।',
    hero_cta_store: 'সার্ভিস ক্যাটালগ দেখুন',
    hero_cta_bundles: '১-ক্লিক গ্রোথ প্যাক',
    hero_cta_tools: 'ফ্রি ক্রিয়েটর টুলস',
    hero_metric_1_title: '১৫ মিনিটে ইনস্ট্যান্ট শুরু',
    hero_metric_1_sub: 'অটোমেটেড সার্ভার কিউ',
    hero_metric_2_title: 'নন-ড্রপ প্রোটেকশন',
    hero_metric_2_sub: 'অটো রিফিল গ্যারান্টি',
    hero_metric_3_title: 'বিকাশ ও নগদ অটোমেটিক',
    hero_metric_3_sub: 'ইনস্ট্যান্ট ১-ক্লিক পেমেন্ট',
    hero_metric_4_title: '১,২০,০০০+ অর্ডার সম্পন্ন',
    hero_metric_4_sub: 'ভেরিফায়েড ও নিরাপদ সার্ভিস',

    // Free Trial Booster
    trial_badge: '১-ক্লিক স্পিড টেস্টার • সম্পূর্ণ ফ্রি',
    trial_title: 'সার্ভিস স্পিড সম্পূর্ণ ফ্রিতে টেস্ট করুন (কোন কার্ড বা লগইন লাগবে না)',
    trial_subtitle:
      'নিচে থেকে আপনার পছন্দের ফ্রি স্যাম্পল বেছে নিন, আপনার পোস্ট বা ভিডিওর লিংক দিন এবং চোখের পলকে স্পিড দেখে নিন।',
    trial_input_placeholder: 'আপনার পাবলিক পোস্ট / রিল / ভিডিও লিংক পেস্ট করুন...',
    trial_cta_button: 'ফ্রি স্যাম্পল বুস্ট পাঠান',
    trial_free_badge: '১০০% ফ্রি',
    trial_remaining_quota: 'আপনার আইপি-র জন্য অবশিষ্ট ফ্রি ট্রায়াল কোটা:',
    trial_quota_exhausted: 'আপনার ফ্রি ট্রায়াল সম্পন্ন হয়েছে। বড় গ্রোথের জন্য নিচে আমাদের মাত্র ২ টাকার টেস্ট প্যাকেজ বেছে নিন!',
    trial_starters_title: 'মাইক্রো-টেস্টার প্যাকেজ (মাত্র ২ টাকায় শুরু)',
    trial_starters_badge: 'জিরো-রিস্ক টেস্ট অফার',
    trial_starters_sub: 'পাইকারি রেটে আমাদের প্রিমিয়াম অ্যালগরিদম টেস্ট করতে চান? শুরু করুন মাত্র ২ টাকা থেকে।',
    trial_starters_order_btn: 'অর্ডার করুন',

    // Store & Catalog
    catalog_title: 'সকল প্ল্যাটফর্মের গ্রোথ সার্ভিস',
    catalog_subtitle: 'টপ গ্লোবাল সার্ভারের সাথে সরাসরি কানেক্টেড হাই-রিটেনশন সোশ্যাল গ্রোথ ইঞ্জিন।',
    catalog_search_placeholder: 'ফেসবুক, ইনস্টাগ্রাম, ইউটিউব, টিকটক সার্ভিস খুঁজুন...',
    catalog_filter_all: 'সকল প্ল্যাটফর্ম',
    catalog_badge_instant: 'ইনস্ট্যান্ট শুরু',
    catalog_badge_fast: 'দ্রুত ডেলিভারি',
    catalog_badge_guaranteed: 'নন-ড্রপ রিফিল',
    catalog_order_now: 'অর্ডার করুন',
    catalog_starting_at: 'শুরু মাত্র',
    catalog_per_1k: '/ ১,০০০ টি',
    catalog_min: 'মিনিমাম',
    catalog_max: 'সর্বোচ্চ',
    catalog_details: 'বিস্তারিত বিবরণ',
    catalog_wholesale_terminal: 'হোলসেল কুইক টার্মিনাল',

    // Bundles
    bundles_title: '১-ক্লিক ক্রিয়েটর গ্রোথ বান্ডেল',
    bundles_subtitle: 'আপনার সোশ্যাল প্রোফাইল খুব দ্রুত বুস্ট করতে এবং অ্যালগরিদম এক্টিভ করতে অল-ইন-ওয়ান প্যাক।',
    bundles_save_badge: '৪০% পর্যন্ত ছাড়',
    bundles_get_now: 'বান্ডেলটি নিন',
    bundles_features_included: 'যা যা পাচ্ছেন:',

    // Affiliate
    affiliate_title: 'হিয়ার উই গ্রো-র সাথে পার্টনার হয়ে আয় করুন',
    affiliate_subtitle: 'আপনার রেফারেল লিংক শেয়ার করে প্রতিটি ডিপোজিট ও অর্ডারে লাইফটাইম ১৫% থেকে ২৫% সরাসরি কমিশন আয় করুন।',
    affiliate_register_cta: '৩০ সেকেন্ডে অ্যাফিলিয়েট হিসেবে যোগ দিন',
    affiliate_share_link: 'আপনার রেফারেল ইনকাম লিংক:',
    affiliate_copy_success: 'রেফারেল লিংক কপি হয়েছে!',
    affiliate_earn_rate: '১৫-২৫% লাইফটাইম কমিশন',
    affiliate_instant_payout: 'বিকাশ ও নগদে ইনস্ট্যান্ট উইথড্র (মিনিমাম ১০০৳)',

    // Order Tracker
    tracker_title: 'লাইভ অর্ডার ও সার্ভার ট্র্যাকিং',
    tracker_subtitle: 'সার্ভার কিউ এর সাথে সরাসরি কানেক্টেড। অর্ডারের লাইভ প্রোগ্রেস ও স্ট্যাটাস দেখুন।',
    tracker_input_placeholder: 'আপনার অর্ডার আইডি লিখুন (যেমন HWG-ORD-...)',
    tracker_btn: 'অর্ডার খুঁজুন',
    tracker_no_orders: 'এখনও কোনো অর্ডার পাওয়া যায়নি। গ্রোথ স্টোর থেকে আপনার প্রথম অর্ডার দিন!',

    // Wallet
    wallet_title: 'অ্যাকাউন্ট ওয়ালেট ও ব্যালেন্স',
    wallet_balance_label: 'বর্তমান ব্যালেন্স:',
    wallet_deposit_btn: 'টাকা ডিপোজিট করুন',
    wallet_bkash_auto: 'বিকাশ ও নগদ অটোমেটিক গেটওয়ে',
    wallet_binance_pay: 'বাইনান্স পে ও ক্রিপ্টো (USDT / BTC)',
    wallet_manual_payment: 'ম্যানুয়াল ট্রানজ্যাকশন ভেরিফিকেশন',

    // Geo Modal
    geo_modal_title: 'দেশ, মুদ্রা ও ভাষা নির্বাচন করুন',
    geo_modal_desc: 'আপনার পছন্দের কারেন্সি, পেমেন্ট অপশন এবং ভাষার মাধ্যমে সেরা অভিজ্ঞতা উপভোগ করুন।',
    geo_detected_badge: 'অটোমেটিক চিহ্নিত লোকেশন',
    geo_select_country: 'দেশ / অঞ্চল বেছে নিন',
    geo_select_language: 'ভাষা নির্বাচন করুন',
    geo_select_currency: 'কারেন্সি (মুদ্রা)',
    geo_save_btn: 'সেটিংস সেভ করুন',

    // Footer
    footer_tagline: 'বিশ্বস্ত সোশ্যাল গ্রোথ টুলস ও ইনস্ট্যান্ট ডেলিভারির মাধ্যমে ক্রিয়েটর ও ব্র্যান্ডকে এগিয়ে নেওয়া আমাদের লক্ষ্য।',
    footer_rights: 'সর্বস্বত্ব সংরক্ষিত।',
    footer_support_247: 'হোয়াটসঅ্যাপ ও টেলিগ্রামে ২৪/৭ লাইভ সাপোর্ট',
    footer_guarantee: '১০০% নিরাপদ ও গ্যারান্টিযুক্ত নন-ড্রপ সার্ভিস',
  },
};
