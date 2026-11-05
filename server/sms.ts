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
      // Pasted secrets often carry a trailing space or newline, which the provider reports as an unknown key.
      const apiKey = env.SMS_API_KEY?.trim();
      const senderId = env.SMS_SENDER_ID?.trim();
      if (!apiKey || !senderId) {
        console.error('sms not configured', { hasKey: !!apiKey, hasSender: !!senderId });
        return false;
      }
      try {
        const res = await fetchFn('http://bulksmsbd.net/api/smsapi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: apiKey,
            senderid: senderId,
            number: toInternational(to),
            message,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as { response_code?: number; error_message?: string };
        const ok = res.ok && data.response_code === 202;
        // Provider codes only (never the number), so a failure can be diagnosed from the Worker logs:
        // 1002 sender id invalid, 1005 internal, 1007 balance, 1011 key not found, 1032 IP not whitelisted.
        if (!ok) {
          // The provider's message can echo the API key back, so strip it before logging.
          const message = data.error_message?.split(apiKey).join('[key]');
          console.error('sms send failed', { httpStatus: res.status, code: data.response_code, message });
        }
        return ok;
      } catch (e) {
        console.error('sms send error', e instanceof Error ? e.message : 'unknown');
        return false;
      }
    },
  };
}
