// SMS sending behind a small interface, so the provider can be swapped by config.
// First adapter: BulkSMSBD (http://bulksmsbd.net). SSL Wireless can be added the same way.

export interface SmsProvider {
  send(toLocalNumber: string, message: string): Promise<boolean>;
}

export interface SmsEnv {
  SMS_API_KEY?: string;
  SMS_SENDER_ID?: string;
}

/** bKash-style local number 01XXXXXXXXX → international 8801XXXXXXXXX. */
export const toInternational = (local: string) => `88${local}`;

export function bulkSmsBd(env: SmsEnv, fetchFn: typeof fetch = fetch): SmsProvider {
  return {
    async send(to, message) {
      if (!env.SMS_API_KEY || !env.SMS_SENDER_ID) return false;
      try {
        const res = await fetchFn('http://bulksmsbd.net/api/smsapi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: env.SMS_API_KEY,
            senderid: env.SMS_SENDER_ID,
            number: toInternational(to),
            message,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as { response_code?: number };
        return res.ok && data.response_code === 202;
      } catch {
        return false;
      }
    },
  };
}
