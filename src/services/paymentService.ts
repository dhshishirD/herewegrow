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
 * Follows official UddoktaPay / Paymently API specification (https://uddoktapay.readme.io/reference/create-charge)
 */
export const initiateAutomatedPayment = async (
  amount: number,
  fullName: string = 'HereWeGrow Customer',
  email: string = 'customer@herewegrow.pro',
  metadata?: Record<string, any>
): Promise<{ success: boolean; paymentUrl?: string; message: string }> => {
  try {
    const payload = {
      full_name: fullName,
      email: email,
      amount: String(amount),
      metadata: {
        platform: 'HereWeGrow',
        time: new Date().toISOString(),
        ...(metadata || {})
      },
      redirect_url: window.location.origin + '/?payment_status=success',
      return_type: 'GET', // Guarantees standard GET browser redirect with ?invoice_id=UP-...
      cancel_url: window.location.origin + '/?payment_status=cancel'
    };

    // 1. Try our Edge Function proxy first (/api/payment)
    try {
      const edgeRes = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: 'checkout-v2', payload })
      });
      if (edgeRes.ok) {
        const data = await edgeRes.json();
        if (data.status && data.payment_url) {
          return { success: true, paymentUrl: data.payment_url, message: 'Payment session created successfully!' };
        }
      }
    } catch {
      // Continue to direct fetch
    }

    // 2. Direct fetch to Paymently API
    let res = await fetch(`${PAYMENT_API_BASE}/checkout-v2`, {
      method: 'POST',
      headers: {
        'RT-UDDOKTAPAY-API-KEY': PAYMENT_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      res = await fetch(`${PAYMENT_API_BASE}/checkout`, {
        method: 'POST',
        headers: {
          'RT-UDDOKTAPAY-API-KEY': PAYMENT_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    }

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
    return {
      success: false,
      message: 'Could not connect to payment gateway. Please use Direct Merchant transfer.'
    };
  }
};

/**
 * Verify a transaction using invoice_id or transaction_id with full status and amount extraction
 */
export const verifyAutomatedPayment = async (
  invoiceId: string
): Promise<{ 
  success: boolean; 
  status?: string; 
  amount?: number; 
  invoiceId?: string; 
  trxId?: string; 
  paymentMethod?: string; 
  metadata?: any; 
  message?: string 
}> => {
  if (!invoiceId || !invoiceId.trim()) {
    return { success: false, message: 'Please provide a valid Invoice ID or Transaction ID.' };
  }

  const cleanId = invoiceId.trim();

  try {
    // 1. Try our Edge Function proxy first (/api/payment)
    try {
      const edgeRes = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: 'verify-payment', payload: { invoice_id: cleanId } })
      });
      if (edgeRes.ok) {
        const data = await edgeRes.json();
        if (data.status === 'COMPLETED' || data.status === 'SUCCESS' || data.status === true) {
          return {
            success: true,
            status: 'COMPLETED',
            amount: parseFloat(data.amount || data.charged_amount || '0'),
            invoiceId: data.invoice_id || cleanId,
            trxId: data.transaction_id || data.trx_id,
            paymentMethod: data.payment_method || 'bkash',
            metadata: data.metadata,
            message: 'Payment verified successfully!'
          };
        }
      }
    } catch {
      // Continue to direct fetch
    }

    // 2. Direct fetch
    const res = await fetch(`${PAYMENT_API_BASE}/verify-payment`, {
      method: 'POST',
      headers: {
        'RT-UDDOKTAPAY-API-KEY': PAYMENT_API_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ invoice_id: cleanId })
    });
    
    const data = await res.json();
    if (data.status === 'COMPLETED' || data.status === 'SUCCESS' || data.status === true) {
      return {
        success: true,
        status: 'COMPLETED',
        amount: parseFloat(data.amount || data.charged_amount || '0'),
        invoiceId: data.invoice_id || cleanId,
        trxId: data.transaction_id || data.trx_id,
        paymentMethod: data.payment_method || 'bkash',
        metadata: data.metadata,
        message: 'Payment verified successfully!'
      };
    }

    return {
      success: false,
      status: data.status,
      message: data.message || 'Payment is not completed yet or invalid Invoice ID.'
    };
  } catch (err: any) {
    console.error('Payment verification error:', err);
    return {
      success: false,
      message: 'Could not connect to payment verification server.'
    };
  }
};
