import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_promotional_banners():
    os.makedirs('public/branding', exist_ok=True)
    
    # Load fonts
    font_bangla_xl = ImageFont.truetype('C:/Windows/Fonts/NirmalaB.ttf', 46)
    font_bangla_lg = ImageFont.truetype('C:/Windows/Fonts/NirmalaB.ttf', 36)
    font_bangla_md = ImageFont.truetype('C:/Windows/Fonts/NirmalaB.ttf', 26)
    font_bangla_sm = ImageFont.truetype('C:/Windows/Fonts/NirmalaB.ttf', 22)
    font_en_bold = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 32)
    font_en_sm = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 20)

    # Master Logo
    logo_img = Image.open('public/branding/herewegrow_logo_friendly_h_arrow.jpg').convert('RGBA')
    logo_small = logo_img.resize((100, 100), Image.Resampling.LANCZOS)
    
    # Mask for round logo
    mask = Image.new('L', (100, 100), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle((0, 0, 100, 100), radius=28, fill=255)

    # -------------------------------------------------------------
    # BANNER 1: F-Commerce Anti-Scam & Trust Booster (1080 x 1080)
    # -------------------------------------------------------------
    b1 = Image.new('RGBA', (1080, 1080), (11, 15, 25, 255))
    draw1 = ImageDraw.Draw(b1)

    # Top Glow
    draw1.rectangle([(0, 0), (1080, 8)], fill=(16, 185, 129, 255))

    # Header section
    b1.paste(logo_small, (80, 70), mask)
    draw1.text((200, 82), "HereWeGrow", font=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 44), fill=(255, 255, 255))
    draw1.rounded_rectangle([(470, 88), (560, 128)], radius=12, fill=(16, 185, 129))
    draw1.text((485, 94), ".PRO", font=font_en_sm, fill=(255, 255, 255))
    draw1.text((202, 138), "#1 Verified Social Creator Engine in Bangladesh", font=font_en_sm, fill=(148, 163, 184))

    # Category Pill
    draw1.rounded_rectangle([(80, 200), (460, 248)], radius=24, fill=(30, 41, 59), outline=(51, 65, 85))
    draw1.text((105, 212), "🛡️ F-COMMERCE TRUST & AUTHORITY", font=font_en_sm, fill=(52, 211, 153))

    # Main Headline
    draw1.text((80, 280), "ইনবক্স সেলারদের বাদ দিন —", font=font_bangla_xl, fill=(255, 255, 255))
    draw1.text((80, 345), "সরাসরি ভেরিফায়েড প্ল্যাটফর্ম!", font=font_bangla_xl, fill=(52, 211, 153))
    draw1.text((80, 420), "Stop risking your money with unverified middlemen • Buy directly from source", font=font_en_sm, fill=(148, 163, 184))

    # 4 Trust Cards
    cards_data1 = [
        ("🔒 ০% পাসওয়ার্ড রিকোয়ার্ড", "১০০% নিরাপদ ও পলিসি কমপ্লায়েন্ট (শুধু পাবলিক পেজ লিঙ্ক)"),
        ("⚡ ৪৫ সেকেন্ডে অটো ডেলিভারি", "অর্ডার করার সাথে সাথে ইনস্ট্যান্ট সার্ভার কিউ শুরু"),
        ("🛡️ ৩৬৫ দিনের নন-ড্রপ রিফিল", "১ বছরের আনকন্ডিশনাল অটোমেটেড রিপ্লেসমেন্ট ওয়ারেন্টি"),
        ("🇧🇩 ১-ক্লিকে বিকাশ ও নগদ পেমেন্ট", "০% গেটওয়ে ফি সহ ইনস্ট্যান্ট অটোমেটেড ভেরিফিকেশন")
    ]

    positions = [(80, 480), (560, 480), (80, 660), (560, 660)]
    for idx, (title, desc) in enumerate(cards_data1):
        x, y = positions[idx]
        draw1.rounded_rectangle([(x, y), (x + 440, y + 150)], radius=20, fill=(15, 23, 42), outline=(30, 41, 59))
        draw1.text((x + 24, y + 24), title, font=font_bangla_md, fill=(255, 255, 255))
        draw1.text((x + 24, y + 75), desc, font=font_bangla_sm, fill=(148, 163, 184))

    # Bottom CTA Bar
    draw1.rounded_rectangle([(80, 860), (1000, 980)], radius=24, fill=(16, 185, 129))
    draw1.text((120, 895), "🌐 অর্ডার করুন আজই: herewegrow.pro", font=font_bangla_lg, fill=(15, 23, 42))
    draw1.text((120, 940), "💬 WhatsApp Support: 01981505759 • Instant Checkout", font=font_en_sm, fill=(15, 23, 42))

    b1.convert('RGB').save('public/branding/promo_ad_fcommerce_trust.jpg', quality=95)

    # -------------------------------------------------------------
    # BANNER 2: Free Speed Trial Lead Magnet (1080 x 1080)
    # -------------------------------------------------------------
    b2 = Image.new('RGBA', (1080, 1080), (15, 23, 42, 255))
    draw2 = ImageDraw.Draw(b2)
    draw2.rectangle([(0, 0), (1080, 8)], fill=(245, 158, 11, 255))

    b2.paste(logo_small, (80, 70), mask)
    draw2.text((200, 82), "HereWeGrow", font=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 44), fill=(255, 255, 255))
    draw2.rounded_rectangle([(470, 88), (560, 128)], radius=12, fill=(245, 158, 11))
    draw2.text((485, 94), ".PRO", font=font_en_sm, fill=(15, 23, 42))
    draw2.text((202, 138), "100% Free Live Speed Tester • No Deposit", font=font_en_sm, fill=(148, 163, 184))

    # Pill
    draw2.rounded_rectangle([(80, 200), (480, 248)], radius=24, fill=(30, 41, 59), outline=(51, 65, 85))
    draw2.text((105, 212), "🎁 100% FREE TRIAL • ZERO COST", font=font_en_sm, fill=(251, 191, 36))

    # Headline
    draw2.text((80, 280), "১ টাকাও লাগবে না!", font=font_bangla_xl, fill=(255, 255, 255))
    draw2.text((80, 345), "৬০ সেকেন্ডে ১০০ ফ্রি ভিউজ টেস্ট করুন ⚡", font=font_bangla_xl, fill=(251, 191, 36))
    draw2.text((80, 420), " মুখে নয়, নিজের চোখে লাইভ স্পিড ও কোয়ালিটি টেস্ট করে দেখুন!", font=font_bangla_md, fill=(226, 232, 240))

    # 3 Easy Steps Box
    draw2.rounded_rectangle([(80, 480), (1000, 810)], radius=24, fill=(11, 15, 25), outline=(30, 41, 59))
    
    steps = [
        ("১. কোনো পাসওয়ার্ড বা লগইন নেই", "শুধু আপনার যেকোনো ভিডিও বা পোস্টের পাবলিক লিঙ্ক পেস্ট করুন।"),
        ("২. সম্পূর্ণ ফ্রি ১-ক্লিক সাবমিট", "কোনো ক্রেডিট কার্ড বা বিকাশ পেমেন্টের প্রয়োজন নেই।"),
        ("৩. ৬০ সেকেন্ডে রেজাল্ট দেখুন", "সরাসরি আপনার ভিডিওতে ১০০ ফ্রি ভিউজ ইনস্ট্যান্ট ডেলিভারি হবে!")
    ]

    for i, (st, sd) in enumerate(steps):
        sy = 515 + (i * 95)
        draw2.rounded_rectangle([(110, sy), (150, sy + 40)], radius=10, fill=(245, 158, 11))
        draw2.text((122, sy + 8), str(i+1), font=font_en_sm, fill=(15, 23, 42))
        draw2.text((170, sy + 4), st, font=font_bangla_md, fill=(255, 255, 255))
        draw2.text((170, sy + 40), sd, font=font_bangla_sm, fill=(148, 163, 184))

    # CTA Button
    draw2.rounded_rectangle([(80, 860), (1000, 980)], radius=24, fill=(245, 158, 11))
    draw2.text((120, 895), "⚡ এখনই ফ্রি ট্রায়াল নিন: herewegrow.pro", font=font_bangla_lg, fill=(15, 23, 42))
    draw2.text((120, 940), "Direct URL: herewegrow.pro/#trial • No Password Required", font=font_en_sm, fill=(15, 23, 42))

    b2.convert('RGB').save('public/branding/promo_ad_free_trial.jpg', quality=95)

    # -------------------------------------------------------------
    # BANNER 3: YouTube Monetization Package (1080 x 1080)
    # -------------------------------------------------------------
    b3 = Image.new('RGBA', (1080, 1080), (11, 15, 25, 255))
    draw3 = ImageDraw.Draw(b3)
    draw3.rectangle([(0, 0), (1080, 8)], fill=(239, 68, 68, 255))

    b3.paste(logo_small, (80, 70), mask)
    draw3.text((200, 82), "HereWeGrow", font=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 44), fill=(255, 255, 255))
    draw3.rounded_rectangle([(470, 88), (560, 128)], radius=12, fill=(239, 68, 68))
    draw3.text((485, 94), ".PRO", font=font_en_sm, fill=(255, 255, 255))
    draw3.text((202, 138), "YouTube Partner Program (YPP) Safe Engine", font=font_en_sm, fill=(148, 163, 184))

    # Pill
    draw3.rounded_rectangle([(80, 200), (520, 248)], radius=24, fill=(30, 41, 59), outline=(51, 65, 85))
    draw3.text((105, 212), "🎬 YOUTUBE ADSENSE MONETIZATION", font=font_en_sm, fill=(248, 113, 113))

    # Headline
    draw3.text((80, 280), "ইউটিউব ৪,০০০ ঘণ্টা ওয়াচ টাইম ও", font=font_bangla_xl, fill=(255, 255, 255))
    draw3.text((80, 345), "১,০০০ সাবস্ক্রাইবার মনিটাইজেশন প্যাকেজ", font=font_bangla_xl, fill=(248, 113, 113))
    draw3.text((80, 420), "100% Policy Compliant • 240,000 Minutes Guaranteed • 365-Day Refill", font=font_en_sm, fill=(148, 163, 184))

    # 4 Benefit Cards
    yt_cards = [
        ("🎬 ২,৪০,০০০ মিনিট ওয়াচ টাইম", "১০০% ডেক্সটপ ও মোবাইল ব্রাউজার রিয়েল প্লেব্যাক"),
        ("📈 স্টুডিও মিটারে লাইভ কাউন্ট", "গুগল অ্যাডসেন্স ও YPP রিভিউ সফলভাবে পাশ করার নিশ্চয়তা"),
        ("🛡️ ৩৬৫ দিনের রিফিল ওয়ারেন্টি", "১ বছর পর্যন্ত যেকোনো ফ্ল্যাকচুয়েশনে অটোমেটিক রিফিল"),
        ("🇧🇩 বিকাশ ও নগদ পেমেন্ট", "১-ক্লিকে ইনস্ট্যান্ট চেকআউট ও ৩-৭ দিনে ড্রিপ-ফিড ডেলিভারি")
    ]

    for idx, (title, desc) in enumerate(yt_cards):
        x, y = positions[idx]
        draw3.rounded_rectangle([(x, y), (x + 440, y + 150)], radius=20, fill=(15, 23, 42), outline=(30, 41, 59))
        draw3.text((x + 24, y + 24), title, font=font_bangla_md, fill=(255, 255, 255))
        draw3.text((x + 24, y + 75), desc, font=font_bangla_sm, fill=(148, 163, 184))

    # CTA
    draw3.rounded_rectangle([(80, 860), (1000, 980)], radius=24, fill=(239, 68, 68))
    draw3.text((120, 895), "🚀 প্যাকেজ দেখুন: herewegrow.pro", font=font_bangla_lg, fill=(255, 255, 255))
    draw3.text((120, 940), "https://herewegrow.pro/services/youtube-monetization • 0% Fee bKash", font=font_en_sm, fill=(255, 255, 255))

    b3.convert('RGB').save('public/branding/promo_ad_youtube_monetization.jpg', quality=95)

    # -------------------------------------------------------------
    # BANNER 4: Student & Freelancer Affiliate Earning (1080 x 1080)
    # -------------------------------------------------------------
    b4 = Image.new('RGBA', (1080, 1080), (11, 15, 25, 255))
    draw4 = ImageDraw.Draw(b4)
    draw4.rectangle([(0, 0), (1080, 8)], fill=(99, 102, 241, 255))

    b4.paste(logo_small, (80, 70), mask)
    draw4.text((200, 82), "HereWeGrow", font=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 44), fill=(255, 255, 255))
    draw4.rounded_rectangle([(470, 88), (560, 128)], radius=12, fill=(99, 102, 241))
    draw4.text((485, 94), ".PRO", font=font_en_sm, fill=(255, 255, 255))
    draw4.text((202, 138), "15% - 25% Lifetime Recurring Affiliate Commission", font=font_en_sm, fill=(148, 163, 184))

    # Pill
    draw4.rounded_rectangle([(80, 200), (510, 248)], radius=24, fill=(30, 41, 59), outline=(51, 65, 85))
    draw4.text((105, 212), "💼 STUDENT & FREELANCER INCOME", font=font_en_sm, fill=(165, 180, 252))

    # Headline
    draw4.text((80, 280), "ঘরে বসে সোশ্যাল মিডিয়ায় কাজ করে", font=font_bangla_xl, fill=(255, 255, 255))
    draw4.text((80, 345), "মাসে ১৫,০০০–৩০,০০০+ টাকা ইনকাম করুন!", font=font_bangla_xl, fill=(165, 180, 252))
    draw4.text((80, 420), "Zero Investment • Zero Capital • Lifetime Recurring Commission Engine", font=font_en_sm, fill=(148, 163, 184))

    aff_cards = [
        ("💼 ১৫% থেকে ২৫% লাইফটাইম কমিশন", "আপনার রেফারেল লিঙ্কের মাধ্যমে যেকোনো অর্ডারে কমিশন"),
        ("⚡ কোনো ইনভেস্টমেন্ট বা ফি নেই", "সম্পূর্ণ ফ্রিতে ১ মিনিটে অ্যাফিলিয়েট অ্যাকাউন্ট খুলুন"),
        ("📱 মোবাইল দিয়েই কাজ করুন", "ফেসবুক, ইউটিউব, টিকটকে লিঙ্ক শেয়ার করে ক্লায়েন্ট আনুন"),
        ("💵 সরাসরি বিকাশ ও নগদে ক্যাশআউট", "উপার্জিত টাকা ইনস্ট্যান্ট বিকাশ/নগদে উইথড্র সুবিধা")
    ]

    for idx, (title, desc) in enumerate(aff_cards):
        x, y = positions[idx]
        draw4.rounded_rectangle([(x, y), (x + 440, y + 150)], radius=20, fill=(15, 23, 42), outline=(30, 41, 59))
        draw4.text((x + 24, y + 24), title, font=font_bangla_md, fill=(255, 255, 255))
        draw4.text((x + 24, y + 75), desc, font=font_bangla_sm, fill=(148, 163, 184))

    # CTA
    draw4.rounded_rectangle([(80, 860), (1000, 980)], radius=24, fill=(99, 102, 241))
    draw4.text((120, 895), "💎 ফ্রি পার্টনার হিসেবে জয়েন করুন", font=font_bangla_lg, fill=(255, 255, 255))
    draw4.text((120, 940), "https://herewegrow.pro/#affiliate • Start Earning Today", font=font_en_sm, fill=(255, 255, 255))

    b4.convert('RGB').save('public/branding/promo_ad_affiliate_earning.jpg', quality=95)

    print("All 4 High-Resolution Promotional Banners have been rendered and saved to public/branding/!")

if __name__ == '__main__':
    create_promotional_banners()
