/**
 * Paymently / UddoktaPay Automated Payment Gateway Service for HereWeGrow
 * Endpoint: https://herewegrow.paymently.io/api
 */

export interface PaymentCheckoutRequest {
  amount: number;
  fullName?: string;
  email?: string;
  redirectUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentCheckoutResponse {
  status: boolean;
  message: string;
  payment_url?: string;
}

const PAYMENT_API_BASE = 'https://herewegrow.paymently.io/api';
const PAYMENT_API_KEY = 'RDJmQ6RiAwFSaZGevSVoH6TqJ11gal3EulBnKszW';

/**
 * Creates an automated instant checkout session for bKash, Nagad, Rocket, Cards
 */
export const initiateAutomatedPayment = async (
  amount: number,
  fullName: string = 'HereWeGrow Customer',
  email: string = 'customer@herewegrow.pro'
): Promise<{ success: boolean; paymentUrl?: string; message: string }> => {
  try {
    const payload = {
      full_name: fullName,
      email: email,
      amount: String(amount),
      metadata: {
        platform: 'HereWeGrow',
        time: new Date().toISOString()
      },
      redirect_url: window.location.origin + '/?payment_status=success',
      cancel_url: window.location.origin + '/?payment_status=cancel'
    };

    const res = await fetch(`${PAYMENT_API_BASE}/checkout`, {
      method: 'POST',
      headers: {
        'RT-UDDOKTAPAY-API-KEY': PAYMENT_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data: PaymentCheckoutResponse = await res.json();
    if (data.status && data.payment_url) {
      return {
        success: true,
        paymentUrl: data.payment_url,
        message: 'Payment session created successfully!'
      };
    }

    return {
      success: false,
      message: data.message || 'Failed to initialize payment gateway.'
    };
  } catch (err: any) {
    console.error('Payment initialization error:', err);
    // Fallback proxy attempt if browser CORS intervenes
    try {
      const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(`${PAYMENT_API_BASE}/checkout`)}`;
      const res = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'RT-UDDOKTAPAY-API-KEY': PAYMENT_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: fullName,
          email: email,
          amount: String(amount),
          metadata: { platform: 'HereWeGrow' },
          redirect_url: window.location.origin + '/?payment_status=success',
          cancel_url: window.location.origin + '/?payment_status=cancel'
        })
      });
      const data = await res.json();
      if (data.status && data.payment_url) {
        return { success: true, paymentUrl: data.payment_url, message: 'Payment session created!' };
      }
    } catch (proxyErr) {
      console.error('Proxy payment error:', proxyErr);
    }

    return {
      success: false,
      message: 'Could not connect to payment gateway. Please use Direct Merchant transfer.'
    };
  }
};

/**
 * Verify a transaction using invoice_id or transaction_id
 */
export const verifyAutomatedPayment = async (invoiceId: string): Promise<boolean> => {
  try {
    const res = await fetch(`${PAYMENT_API_BASE}/verify-payment`, {
      method: 'POST',
      headers: {
        'RT-UDDOKTAPAY-API-KEY': PAYMENT_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ invoice_id: invoiceId })
    });
    const data = await res.json();
    return data.status === 'COMPLETED';
  } catch (err) {
    console.error('Payment verification error:', err);
    return false;
  }
};
