import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Terminal, 
  Key
} from 'lucide-react';

export const ApiDocsSection: React.FC = () => {
  const [activeLang, setActiveLang] = useState<'curl' | 'python' | 'node' | 'php'>('curl');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [apiKey, setApiKey] = useState('hwg_live_8f93e102847c91a0b329');

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const codeSnippets = {
    curl: `curl -X POST https://herewegrow.pro/api/v2 \\
  -H "Content-Type: application/json" \\
  -d '{
    "key": "${apiKey}",
    "action": "add",
    "service": "fb-001",
    "link": "https://facebook.com/yourbrand",
    "quantity": 1000
  }'`,
    python: `import requests

url = "https://herewegrow.pro/api/v2"
payload = {
    "key": "${apiKey}",
    "action": "add",
    "service": "fb-001",
    "link": "https://facebook.com/yourbrand",
    "quantity": 1000
}

response = requests.post(url, json=payload)
print(response.json())`,
    node: `const axios = require('axios');

async function createOrder() {
  const { data } = await axios.post('https://herewegrow.pro/api/v2', {
    key: '${apiKey}',
    action: 'add',
    service: 'fb-001',
    link: 'https://facebook.com/yourbrand',
    quantity: 1000
  });
  console.log('Order Result:', data);
}

createOrder();`,
    php: `<?php
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => 'https://herewegrow.pro/api/v2',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => json_encode(array(
    'key' => '${apiKey}',
    'action' => 'add',
    'service' => 'fb-001',
    'link' => 'https://facebook.com/yourbrand',
    'quantity' => 1000
  )),
  CURLOPT_HTTPHEADER => array('Content-Type: application/json'),
));

$response = curl_exec($curl);
curl_close($curl);
echo $response;`
  };

  const sampleResponse = `{
  "status": "success",
  "order": 982491,
  "charge": "320.00",
  "currency": "BDT",
  "start_count": 1420,
  "remains": 1000,
  "server_node": "BD-DHK-01"
}`;

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-3 border border-indigo-200/60">
          <Code2 className="w-3.5 h-3.5" />
          <span>SMM API v2 Standard</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          High-Speed Automated Reseller API
        </h2>
        <p className="mt-2 text-slate-600 text-sm">
          Connect your custom panel or agency automation software. Compatible with PerfectPanel, SmartPanel, and RentPanel.
        </p>
      </div>

      {/* API Key Box */}
      <div className="white-card p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0 font-bold">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Your Personal Reseller API Key</div>
            <div className="font-mono text-sm font-bold text-slate-900 mt-0.5">{apiKey}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleCopyCode(apiKey)}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-300 flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Key</span>
          </button>
          <button
            onClick={() => setApiKey('hwg_live_' + Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12))}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all"
          >
            Regenerate Key
          </button>
        </div>
      </div>

      {/* Code Snippet Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Actions List */}
        <div className="white-card p-6 rounded-3xl border border-slate-200 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Supported API Actions</h3>
          
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-mono font-bold text-emerald-700">action: "services"</div>
              <p className="text-slate-600 text-[11px]">List all active services, rates, min/max limits & categories.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-mono font-bold text-indigo-700">action: "add"</div>
              <p className="text-slate-600 text-[11px]">Place a new automated order with service ID, link, and quantity.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-mono font-bold text-pink-700">action: "status"</div>
              <p className="text-slate-600 text-[11px]">Check real-time delivery status, remains, and start count.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-mono font-bold text-amber-700">action: "refill"</div>
              <p className="text-slate-600 text-[11px]">Trigger instant automated replacement refill for dropped counts.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-mono font-bold text-slate-700">action: "balance"</div>
              <p className="text-slate-600 text-[11px]">Retrieve current wallet balance in BDT & USD.</p>
            </div>
          </div>
        </div>

        {/* Right Code Display */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-md">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-300 font-mono">POST https://herewegrow.pro/api/v2</span>
              </div>

              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl text-[11px] font-bold">
                {(['curl', 'python', 'node', 'php'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={`px-2.5 py-1 rounded-lg uppercase transition-all ${
                      activeLang === lang
                        ? 'bg-indigo-600 text-white font-extrabold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 relative bg-[#090D16]">
              <button
                onClick={() => handleCopyCode(codeSnippets[activeLang])}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                title="Copy Snippet"
              >
                {copiedSnippet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              <pre className="text-xs font-mono text-indigo-200 overflow-x-auto leading-relaxed">
                <code>{codeSnippets[activeLang]}</code>
              </pre>
            </div>
          </div>

          {/* Sample Response */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
            <div className="px-5 py-2.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between text-xs font-bold text-slate-400">
              <span>JSON Response (HTTP 200 OK)</span>
              <span className="text-emerald-400">Latency: ~38ms</span>
            </div>
            <div className="p-5 bg-[#090D16]">
              <pre className="text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                <code>{sampleResponse}</code>
              </pre>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
};
