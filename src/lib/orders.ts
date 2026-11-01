// Remembers this browser's recent purchases so buyers can download again.
// Only invoice IDs and product IDs are kept, on this device, never sent anywhere else.

export interface SavedOrder {
  invoiceId: string;
  productId: string;
  at: number;
}

const KEY = 'hwg_orders';

export function savedOrders(): SavedOrder[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? '[]') as SavedOrder[];
    return Array.isArray(list) ? list.filter((o) => o && typeof o.invoiceId === 'string') : [];
  } catch {
    return [];
  }
}

export function saveOrder(order: SavedOrder) {
  try {
    const rest = savedOrders().filter((o) => o.invoiceId !== order.invoiceId);
    localStorage.setItem(KEY, JSON.stringify([order, ...rest].slice(0, 10)));
  } catch {
    // storage unavailable: nothing to remember
  }
}

export interface VerifyResponse {
  ok: boolean;
  status?: 'paid' | 'pending' | 'unpaid';
  invoiceId?: string;
  productId?: string | null;
  amount?: number;
  transactionId?: string | null;
  downloads?: { file: string; url: string; bytes: number }[];
}

export async function verifyInvoice(invoiceId: string): Promise<VerifyResponse> {
  const r = await fetch('/api/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ invoiceId }) });
  return (await r.json()) as VerifyResponse;
}
