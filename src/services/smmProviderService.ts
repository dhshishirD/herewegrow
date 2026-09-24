/**
 * Standard SMM Provider API v2 Client Engine for HereWeGrow
 * Configured for JustAnotherPanel (https://justanotherpanel.com/api/v2) & all standard SMM API v2 providers.
 */

export interface SmmProviderConfig {
  apiUrl: string;
  apiKey: string;
  isActive: boolean;
  name: string;
  autoDispatch?: boolean; // Default false: requires manual admin approval before spending Peakerr balance
}

export interface ProviderBalanceResponse {
  balance?: string;
  currency?: string;
  error?: string;
}

export interface ProviderOrderResponse {
  order?: number | string;
  error?: string;
}

export interface ProviderStatusResponse {
  charge?: string;
  start_count?: string;
  status?: 'Pending' | 'In progress' | 'Completed' | 'Partial' | 'Canceled' | 'Processing';
  remains?: string;
  currency?: string;
  error?: string;
}

const PROVIDER_STORAGE_KEY = 'herewegrow_smm_provider_config_v2';

// Default Peakerr Configuration (Safe Manual Approval Mode Enabled)
export const getProviderConfig = (): SmmProviderConfig => {
  try {
    const saved = localStorage.getItem(PROVIDER_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading provider config:', e);
  }
  return {
    apiUrl: 'https://peakerr.com/api/v2',
    apiKey: '837a74cb5bf48bb7a0b671b9234e8154',
    isActive: true,
    name: 'Peakerr - Primary Wholesale Engine',
    autoDispatch: false // Default to safe manual approval mode to protect balance
  };
};

export const saveProviderConfig = (config: SmmProviderConfig): void => {
  try {
    localStorage.setItem(PROVIDER_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving provider config:', e);
  }
};

/**
 * Helper to execute POST requests with CORS-aware fallback
 */
const postToProviderApi = async (url: string, params: Record<string, string>): Promise<any> => {
  const formData = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => formData.append(k, v));

  try {
    // 1. Try direct fetch
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });
    return await response.json();
  } catch (directError) {
    console.warn('Direct provider API fetch failed, trying CORS proxy fallback:', directError);
    // 2. Fallback via reliable CORS proxy for client-side API testing
    try {
      const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
      const proxyResponse = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });
      return await proxyResponse.json();
    } catch (proxyError) {
      console.error('All provider API attempts failed:', proxyError);
      throw proxyError;
    }
  }
};

/**
 * 1. Check Wholesale Provider Balance
 * action: "balance"
 */
export const fetchProviderBalance = async (): Promise<{ success: boolean; balance?: string; currency?: string; message?: string }> => {
  const config = getProviderConfig();
  if (!config.apiKey || !config.isActive) {
    return {
      success: true,
      balance: '100.84',
      currency: 'USD',
      message: 'Simulation Mode: Enter your JustAnotherPanel API key to connect live.'
    };
  }

  try {
    const data = await postToProviderApi(config.apiUrl, {
      key: config.apiKey,
      action: 'balance'
    });

    if (data.balance) {
      return { success: true, balance: String(data.balance), currency: data.currency || 'USD' };
    }
    return { success: false, message: data.error || 'Invalid API key or balance response from provider.' };
  } catch (error: any) {
    console.error('Provider balance error:', error);
    return { success: false, message: 'Could not connect to JustAnotherPanel API endpoint.' };
  }
};

/**
 * 2. Dispatch Order to Wholesale SMM Provider
 * action: "add", service: id, link: url, quantity: qty
 */
export const dispatchToProvider = async (
  providerServiceId: number | string,
  link: string,
  quantity: number
): Promise<{ success: boolean; providerOrderId?: string; message: string }> => {
  const config = getProviderConfig();

  // If live provider is not configured, simulate order placement
  if (!config.apiKey || !config.isActive) {
    const mockId = 'JAP-' + Math.floor(100000 + Math.random() * 900000);
    return {
      success: true,
      providerOrderId: mockId,
      message: `Order queued (JAP Simulation #${mockId})`
    };
  }

  try {
    const data = await postToProviderApi(config.apiUrl, {
      key: config.apiKey,
      action: 'add',
      service: String(providerServiceId),
      link,
      quantity: String(quantity)
    });

    if (data.order) {
      return {
        success: true,
        providerOrderId: String(data.order),
        message: `Order #${data.order} successfully pushed to JustAnotherPanel!`
      };
    }

    return {
      success: false,
      message: data.error || 'Provider rejected the order.'
    };
  } catch (error: any) {
    console.error('Provider dispatch error:', error);
    return {
      success: false,
      message: 'Network error connecting to JustAnotherPanel API.'
    };
  }
};

/**
 * 3. Query Real-Time Status from Wholesale Provider
 * action: "status", order: orderId
 */
export const queryProviderOrderStatus = async (
  providerOrderId: string
): Promise<ProviderStatusResponse> => {
  const config = getProviderConfig();

  if (!config.apiKey || !config.isActive) {
    return {
      status: 'In progress',
      start_count: '150',
      remains: '120',
      charge: '0.28'
    };
  }

  try {
    const data = await postToProviderApi(config.apiUrl, {
      key: config.apiKey,
      action: 'status',
      order: providerOrderId
    });

    return data;
  } catch (error) {
    console.error('Provider status check error:', error);
    return { error: 'Failed to retrieve status from provider' };
  }
};

/**
 * 4. Trigger Provider Refill
 * action: "refill", order: orderId
 */
export const triggerProviderRefill = async (
  providerOrderId: string
): Promise<{ success: boolean; refillId?: string; message: string }> => {
  const config = getProviderConfig();

  if (!config.apiKey || !config.isActive) {
    return {
      success: true,
      refillId: 'RFL-' + Math.floor(10000 + Math.random() * 90000),
      message: `Refill command accepted for Order #${providerOrderId}`
    };
  }

  try {
    const data = await postToProviderApi(config.apiUrl, {
      key: config.apiKey,
      action: 'refill',
      order: providerOrderId
    });

    if (data.refill) {
      return {
        success: true,
        refillId: String(data.refill),
        message: `Refill #${data.refill} initiated on JustAnotherPanel!`
      };
    }
    return { success: false, message: data.error || 'Provider rejected refill request.' };
  } catch (error) {
    console.error('Provider refill error:', error);
    return { success: false, message: 'Provider refill API timeout.' };
  }
};
