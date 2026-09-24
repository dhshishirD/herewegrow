// Cloudflare Pages Serverless Edge Function: /api/provider
// Direct Server-to-Server Proxy for Peakerr Wholesale API (0 CORS issues)

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

    const apiKey = body.key || '837a74cb5bf48bb7a0b671b9234e8154';
    const action = body.action || 'balance';

    const postParams = new URLSearchParams();
    postParams.append('key', apiKey);
    postParams.append('action', action);

    if (body.service) postParams.append('service', String(body.service));
    if (body.link) postParams.append('link', String(body.link));
    if (body.quantity) postParams.append('quantity', String(body.quantity));
    if (body.order) postParams.append('order', String(body.order));
    if (body.orders) postParams.append('orders', String(body.orders));

    const peakerrRes = await fetch('https://peakerr.com/api/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'HereWeGrow-Edge-Proxy/2.0'
      },
      body: postParams.toString()
    });

    const responseData = await peakerrRes.json();

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
      JSON.stringify({ error: error?.message || 'Error communicating with Peakerr Wholesale API' }),
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

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*'
    }
  });
}
