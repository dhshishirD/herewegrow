import type { SmmOrder } from '../types';

const ADMIN_EMAIL_KEY = 'hwg_admin_notification_email_v2';
const DEFAULT_ADMIN_EMAIL = 'dhshishir3@gmail.com';

export const getAdminNotificationEmail = (): string => {
  try {
    const saved = localStorage.getItem(ADMIN_EMAIL_KEY);
    if (saved && saved.includes('@') && saved !== 'dhshishird@gmail.com') return saved;
  } catch {}
  return DEFAULT_ADMIN_EMAIL;
};

export const setAdminNotificationEmail = (email: string): void => {
  try {
    localStorage.setItem(ADMIN_EMAIL_KEY, email.trim());
  } catch (e) {
    console.error('Error saving admin email:', e);
  }
};

/**
 * Sends an instant email notification to the site owner whenever a new order is placed.
 */
export const dispatchOrderEmailAlert = async (
  order: SmmOrder,
  extraDetails?: { providerBalance?: string; profitMargin?: string }
): Promise<{ success: boolean; message?: string }> => {
  const adminEmail = getAdminNotificationEmail();
  
  const payload = {
    _subject: `🚀 [HereWeGrow Order] #${order.id} — ${order.serviceName} (${order.currency === 'BDT' ? '৳' + order.chargeBDT.toFixed(2) : '$' + order.chargeUSD.toFixed(2)})`,
    _template: 'table',
    _captcha: 'false',
    orderId: order.id,
    service: order.serviceName,
    platform: order.platform.toUpperCase(),
    targetLink: order.link,
    quantity: order.quantity.toLocaleString(),
    amountCharged: order.currency === 'BDT' ? `৳${order.chargeBDT.toFixed(2)} BDT` : `$${order.chargeUSD.toFixed(2)} USD`,
    orderStatus: order.status.toUpperCase(),
    peakerrWholesaleId: order.providerOrderId || 'Queued / Direct',
    placedAt: order.createdAt || new Date().toLocaleString(),
    providerBalanceRemaining: extraDetails?.providerBalance ? `$${extraDetails.providerBalance} USD` : 'Check Dashboard',
    profitEstimate: extraDetails?.profitMargin || 'Automatic (40-60%)',
    siteUrl: 'https://herewegrow.pro'
  };

  try {
    // 1. Dispatch via FormSubmit AJAX service (100% Free, reliable client-side email delivery)
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(adminEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      return { success: true, message: `Order notification email sent to ${adminEmail}` };
    }
  } catch (err) {
    console.warn('Email notification dispatch notice (non-critical):', err);
  }

  return { success: false, message: 'Notification queued locally' };
};

/**
 * Sends an instant email notification when a user tops up their wallet.
 */
export const dispatchDepositEmailAlert = async (
  method: string,
  amount: number,
  currency: string,
  newBalance: number
): Promise<void> => {
  const adminEmail = getAdminNotificationEmail();
  
  const payload = {
    _subject: `💰 [HereWeGrow Deposit] +${currency === 'BDT' ? '৳' + amount : '$' + amount} via ${method.toUpperCase()}`,
    _template: 'table',
    _captcha: 'false',
    paymentMethod: method.toUpperCase(),
    amountDeposited: `${currency === 'BDT' ? '৳' : '$'}${amount} ${currency}`,
    newUserBalance: `${currency === 'BDT' ? '৳' : '$'}${newBalance} ${currency}`,
    timestamp: new Date().toLocaleString(),
    siteUrl: 'https://herewegrow.pro'
  };

  try {
    await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(adminEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('Deposit alert notice:', err);
  }
};

/**
 * Sends an instant email notification when someone opens a new affiliate account.
 */
export const dispatchAffiliateRegistrationAlert = async (
  profile: { name: string; phoneOrBkash: string; email?: string; institution?: string; code: string }
): Promise<void> => {
  const adminEmail = getAdminNotificationEmail();

  const payload = {
    _subject: `🤝 [New Affiliate Partner] ${profile.name} (${profile.code}) Joined HereWeGrow`,
    _template: 'table',
    _captcha: 'false',
    partnerName: profile.name,
    referralCode: profile.code,
    phoneOrBkash: profile.phoneOrBkash,
    email: profile.email || 'Not provided',
    institution: profile.institution || 'Campus Ambassador',
    registeredAt: new Date().toLocaleString(),
    dashboardUrl: 'https://herewegrow.pro'
  };

  try {
    await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(adminEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('Affiliate registration alert notice:', err);
  }
};
