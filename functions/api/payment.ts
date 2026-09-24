// Cloudflare Pages Serverless Edge Function: /api/payment
// Direct Server-to-Server Proxy for UddoktaPay / Paymently API (0 CORS issues)

const PAYMENT_API_BASE = 'https://herewegrow.paymently.io/api';
const PAYMENT_API_KEY = 'RDJmQ6RiAwFSaZGevSVoH6TqJ11gal3EulBnKszW';

export async function onRequestPost(context: any) {
  try {
    const body = await context.request.json().catch(async () => {
      const formData = await context.request.formData();
      const obj: Record<string, any> = {};
      formData.forEach((value: any, key: string) => {
        obj[key] = value;
      });
      return obj;
    });

    const endpoint = body.endpoint || 'verify-payment'; // 'checkout-v2' or 'verify-payment'
    const targetUrl = `${PAYMENT_API_BASE}/${endpoint}`;

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'RT-UDDOKTAPAY-API-KEY': PAYMENT_API_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body.payload || body)
    });

    const responseData = await res.json();

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*'
      }
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || 'Error communicating with Payment Gateway' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}

export const onRequest = onRequestPost;
export const onRequestGet = onRequestPost;
