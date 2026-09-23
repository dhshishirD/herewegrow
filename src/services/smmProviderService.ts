/**
 * Standard SMM Provider API v2 Client Engine for HereWeGrow
 * Compatible with all standard SMM API v2 wholesale providers.
 */

export interface SmmProviderConfig {
  apiUrl: string;
  apiKey: string;
  isActive: boolean;
  name: string;
}

export interface ProviderBalanceResponse {
  balance: string;
  currency: string;
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

const PROVIDER_STORAGE_KEY = 'herewegrow_smm_provider_config_v1';

// Default / Stored Provider Config
export const getProviderConfig = (): SmmProviderConfig => {
  try {
    const saved = localStorage.getItem(PROVIDER_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading provider config:', e);
  }
  return {
    apiUrl: 'https://api.smm-provider.com/api/v2',
    apiKey: '',
    isActive: false,
    name: 'Wholesale SMM Node #1'
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
 * 1. Check Wholesale Provider Balance
 */
export const fetchProviderBalance = async (): Promise<{ success: boolean; balance?: string; currency?: string; message?: string }> => {
  const config = getProviderConfig();
  if (!config.apiKey || !config.isActive) {
    return {
      success: true,
      balance: '248.50',
      currency: 'USD',
      message: 'Simulation Mode: Connect your live API Key in Provider Settings.'
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('key', config.apiKey);
    formData.append('action', 'balance');

    const res = await fetch(config.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    const data: ProviderBalanceResponse = await res.json();
    if (data.balance) {
      return { success: true, balance: data.balance, currency: data.currency || 'USD' };
    }
    return { success: false, message: 'Invalid response from supplier API.' };
  } catch (error) {
    console.error('Provider balance fetch error:', error);
    return { success: false, message: 'Could not connect to Provider API endpoint.' };
  }
};

/**
 * 2. Dispatch Order to Wholesale SMM Provider
 */
export const dispatchToProvider = async (
  providerServiceId: number | string,
  link: string,
  quantity: number
): Promise<{ success: boolean; providerOrderId?: string; message: string }> => {
  const config = getProviderConfig();

  // If live provider is not configured, simulate order placement with auto-generated ID
  if (!config.apiKey || !config.isActive) {
    const mockId = 'PRV-' + Math.floor(100000 + Math.random() * 900000);
    return {
      success: true,
      providerOrderId: mockId,
      message: `Order dispatched to queue (Simulated Node #${mockId})`
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('key', config.apiKey);
    formData.append('action', 'add');
    formData.append('service', String(providerServiceId));
    formData.append('link', link);
    formData.append('quantity', String(quantity));

    const res = await fetch(config.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });

    const data: ProviderOrderResponse = await res.json();
    if (data.order) {
      return {
        success: true,
        providerOrderId: String(data.order),
        message: `Order successfully pushed to wholesale server (Order #${data.order})`
      };
    }

    return {
      success: false,
      message: data.error || 'Provider rejected the order request.'
    };
  } catch (error) {
    console.error('Provider dispatch error:', error);
    return {
      success: false,
      message: 'Network timeout connecting to wholesale provider server.'
    };
  }
};

/**
 * 3. Query Real-Time Status from Wholesale Provider
 */
export const queryProviderOrderStatus = async (
  providerOrderId: string
): Promise<ProviderStatusResponse> => {
  const config = getProviderConfig();

  if (!config.apiKey || !config.isActive) {
    return {
      status: 'In progress',
      start_count: '150',
      remains: '200',
      charge: '0.45'
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('key', config.apiKey);
    formData.append('action', 'status');
    formData.append('order', providerOrderId);

    const res = await fetch(config.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });

    const data: ProviderStatusResponse = await res.json();
    return data;
  } catch (error) {
    console.error('Provider status check error:', error);
    return { error: 'Failed to retrieve status from provider' };
  }
};

/**
 * 4. Trigger Provider Refill
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
    const formData = new URLSearchParams();
    formData.append('key', config.apiKey);
    formData.append('action', 'refill');
    formData.append('order', providerOrderId);

    const res = await fetch(config.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });

    const data = await res.json();
    if (data.refill) {
      return {
        success: true,
        refillId: String(data.refill),
        message: `Refill #${data.refill} initiated by provider server.`
      };
    }
    return { success: false, message: data.error || 'Provider rejected refill request.' };
  } catch (error) {
    console.error('Provider refill error:', error);
    return { success: false, message: 'Provider refill API timeout.' };
  }
};
