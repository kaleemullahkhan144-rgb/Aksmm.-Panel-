import React, { useState } from 'react';
import { useSMM } from '../../context/SMMContext';
import {
  Code2,
  Key,
  Copy,
  Check,
  RefreshCw,
  Terminal,
  Play,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const ApiDocs: React.FC = () => {
  const { currentUser, regenerateApiKey, services, orders, formatCurrency } = useSMM();

  const [copiedKey, setCopiedKey] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'curl' | 'php' | 'python' | 'node'>('curl');

  // Interactive console state
  const [testAction, setTestAction] = useState<'balance' | 'services' | 'add' | 'status'>('balance');
  const [testServiceId, setTestServiceId] = useState<number>(services[0]?.id || 101);
  const [testLink, setTestLink] = useState('https://instagram.com/my_page');
  const [testQuantity, setTestQuantity] = useState<number>(1000);
  const [testOrderId, setTestOrderId] = useState<number>(orders[0]?.id || 10042);
  const [consoleOutput, setConsoleOutput] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const apiKey = currentUser?.apiKey || 'usr_key_demo_api_key_12345';

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerate = () => {
    if (!currentUser) return;
    if (confirm('Are you sure you want to generate a new API Key? Your existing integrations will need to be updated.')) {
      regenerateApiKey(currentUser.id);
    }
  };

  const executeApiSimulation = () => {
    setIsExecuting(true);
    setConsoleOutput('Sending POST request to /api/v2...');

    setTimeout(() => {
      let response: any = {};

      if (testAction === 'balance') {
        response = {
          balance: currentUser ? currentUser.balance.toFixed(4) : '150.0000',
          currency: 'USD'
        };
      } else if (testAction === 'services') {
        response = services.slice(0, 4).map(s => ({
          service: s.id,
          name: s.name,
          type: s.type,
          category: `Category #${s.categoryId}`,
          rate: s.rate.toFixed(4),
          min: s.minQuantity,
          max: s.maxQuantity,
          refill: s.refill,
          cancel: false
        }));
      } else if (testAction === 'add') {
        const found = services.find(s => s.id === testServiceId);
        if (!found) {
          response = { error: 'Service not found' };
        } else if (testQuantity < found.minQuantity || testQuantity > found.maxQuantity) {
          response = { error: `Quantity must be between ${found.minQuantity} and ${found.maxQuantity}` };
        } else {
          response = {
            order: Math.floor(10000 + Math.random() * 90000),
            status: 'Pending'
          };
        }
      } else if (testAction === 'status') {
        const order = orders.find(o => o.id === testOrderId);
        if (order) {
          response = {
            charge: order.charge.toFixed(4),
            start_count: String(order.startCount),
            status: order.status.toLowerCase(),
            remains: String(order.remains),
            currency: 'USD'
          };
        } else {
          response = {
            charge: '1.2500',
            start_count: '240',
            status: 'Completed',
            remains: '0',
            currency: 'USD'
          };
        }
      }

      setConsoleOutput(JSON.stringify(response, null, 2));
      setIsExecuting(false);
    }, 450);
  };

  const codeSnippets = {
    curl: `// SMM API v2 - Example cURL Request (Action: add)
curl -X POST https://panel.domain/api/v2 \\
  -d "key=${apiKey}" \\
  -d "action=add" \\
  -d "service=${testServiceId}" \\
  -d "link=${testLink}" \\
  -d "quantity=${testQuantity}"`,

    php: `<?php
// SMM API v2 - Example PHP cURL (Action: add)
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://panel.domain/api/v2');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'key'      => '${apiKey}',
    'action'   => 'add',
    'service'  => ${testServiceId},
    'link'     => '${testLink}',
    'quantity' => ${testQuantity}
]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
?>`,

    python: `# SMM API v2 - Example Python requests (Action: add)
import requests

url = "https://panel.domain/api/v2"
payload = {
    "key": "${apiKey}",
    "action": "add",
    "service": ${testServiceId},
    "link": "${testLink}",
    "quantity": ${testQuantity}
}

response = requests.post(url, data=payload)
print(response.json())`,

    node: `// SMM API v2 - Example Node.js (fetch)
const formData = new URLSearchParams();
formData.append('key', '${apiKey}');
formData.append('action', 'add');
formData.append('service', '${testServiceId}');
formData.append('link', '${testLink}');
formData.append('quantity', '${testQuantity}');

fetch('https://panel.domain/api/v2', {
  method: 'POST',
  body: formData
})
  .then(res => res.json())
  .then(data => console.log('Order Response:', data));`
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Code2 className="w-5 h-5 text-indigo-400" />
          SMM API v2 Integration & Documentation
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Automate your orders, check balances, and integrate our high speed services into your own panel or bot.
        </p>
      </div>

      {/* User API Key Card */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Key className="w-4 h-4 text-indigo-400" />
            Your Private API Key
          </span>
          <span className="text-[10px] text-slate-500">Keep this secret · Do not share</span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-300 break-all select-all">
            {apiKey}
          </div>
          <button
            onClick={copyKey}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0"
          >
            {copiedKey ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            {copiedKey ? 'Copied' : 'Copy Key'}
          </button>
          <button
            onClick={handleRegenerate}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 shrink-0 border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Generate New Key
          </button>
        </div>
      </div>

      {/* Interactive Testing Sandbox */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Interactive API Testing Console
            </h3>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">Live Sandbox</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Action Parameter</label>
            <select
              value={testAction}
              onChange={e => setTestAction(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
            >
              <option value="balance">action: balance</option>
              <option value="services">action: services</option>
              <option value="add">action: add (Place order)</option>
              <option value="status">action: status</option>
            </select>
          </div>

          {testAction === 'add' && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Service ID</label>
                <select
                  value={testServiceId}
                  onChange={e => setTestServiceId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      #{s.id} - {s.name.substring(0, 24)}...
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Quantity</label>
                <input
                  type="number"
                  value={testQuantity}
                  onChange={e => setTestQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                />
              </div>
            </>
          )}

          {testAction === 'status' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Order ID</label>
              <input
                type="number"
                value={testOrderId}
                onChange={e => setTestOrderId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
              />
            </div>
          )}

          <div className="flex items-end">
            <button
              onClick={executeApiSimulation}
              disabled={isExecuting}
              className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <Play className="w-3.5 h-3.5" />
              {isExecuting ? 'Calling API...' : 'Test Endpoint'}
            </button>
          </div>
        </div>

        {consoleOutput && (
          <div className="mt-3 p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1 font-mono">
              <span>Response (HTTP 200 OK)</span>
              <span>Content-Type: application/json</span>
            </div>
            <pre className="text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre">
              {consoleOutput}
            </pre>
          </div>
        )}
      </div>

      {/* Code Snippets Box */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Sample Code Implementation
          </h3>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['curl', 'php', 'python', 'node'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors uppercase ${
                  selectedLanguage === lang
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-300 overflow-x-auto leading-relaxed">
          {codeSnippets[selectedLanguage]}
        </pre>
      </div>

      {/* API Reference Guide */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
        <h3 className="font-bold text-white text-sm">HTTP API v2 Parameter Reference</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2 px-3">Parameters</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              <tr>
                <td className="py-2.5 px-3 font-bold text-indigo-400">key</td>
                <td className="py-2.5 px-3 text-slate-400">string</td>
                <td className="py-2.5 px-3 text-slate-300 font-sans">Your unique private API Key.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-indigo-400">action</td>
                <td className="py-2.5 px-3 text-slate-400">string</td>
                <td className="py-2.5 px-3 text-slate-300 font-sans">One of: balance, services, add, status, multi-status.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-indigo-400">service</td>
                <td className="py-2.5 px-3 text-slate-400">integer</td>
                <td className="py-2.5 px-3 text-slate-300 font-sans">Service ID to order (required for 'add').</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-indigo-400">link</td>
                <td className="py-2.5 px-3 text-slate-400">string</td>
                <td className="py-2.5 px-3 text-slate-300 font-sans">Target link to profile or media.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-indigo-400">quantity</td>
                <td className="py-2.5 px-3 text-slate-400">integer</td>
                <td className="py-2.5 px-3 text-slate-300 font-sans">Number of units to send.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-indigo-400">order</td>
                <td className="py-2.5 px-3 text-slate-400">integer</td>
                <td className="py-2.5 px-3 text-slate-300 font-sans">Order ID (required for 'status').</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
