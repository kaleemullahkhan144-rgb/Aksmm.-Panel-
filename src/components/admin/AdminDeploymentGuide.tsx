import React, { useState } from 'react';
import {
  Database,
  Download,
  Copy,
  Check,
  Server,
  FileCode,
  Terminal,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const AdminDeploymentGuide: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'sql' | 'orders_cron' | 'status_cron'>('sql');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyCode = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sqlSnippet = `-- ApexSMM Database Production Schema
-- Tables: users, categories, services, orders, api_providers, payments, tickets, settings
CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  balance DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
  spent DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
  api_key VARCHAR(64) UNIQUE NULL,
  status ENUM('active', 'suspended', 'banned') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active'
);

CREATE TABLE services (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  rate DECIMAL(10, 4) NOT NULL,
  min_quantity INT UNSIGNED NOT NULL DEFAULT 10,
  max_quantity INT UNSIGNED NOT NULL DEFAULT 50000,
  api_provider_id INT UNSIGNED NULL,
  api_service_id VARCHAR(64) NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  service_id INT UNSIGNED NOT NULL,
  link VARCHAR(512) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  charge DECIMAL(12, 4) NOT NULL,
  start_count INT UNSIGNED DEFAULT 0,
  remains INT UNSIGNED DEFAULT 0,
  status ENUM('Pending', 'Processing', 'In progress', 'Completed', 'Partial', 'Canceled', 'Refunded') DEFAULT 'Pending',
  api_provider_id INT UNSIGNED NULL,
  api_order_id VARCHAR(128) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  method ENUM('easypaisa', 'jazzcash', 'bank_transfer', 'binance_pay', 'perfect_money') NOT NULL,
  amount DECIMAL(12, 4) NOT NULL,
  amount_pkr DECIMAL(12, 2) NULL,
  trx_id VARCHAR(128) NOT NULL,
  sender_phone VARCHAR(64) NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

  const ordersCronSnippet = `<?php
// cron/orders.php - Run every minute via cPanel Cron
$pdo = new PDO("mysql:host=localhost;dbname=smm_panel;charset=utf8mb4", "smm_user", "password");

$sql = "SELECT o.id, o.link, o.quantity, s.api_service_id, p.url, p.api_key
        FROM orders o
        JOIN services s ON o.service_id = s.id
        JOIN api_providers p ON s.api_provider_id = p.id
        WHERE o.status = 'Pending' AND (o.api_order_id IS NULL OR o.api_order_id = '')
        LIMIT 50";

foreach ($pdo->query($sql) as $row) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $row['url']);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'key' => $row['api_key'],
        'action' => 'add',
        'service' => $row['api_service_id'],
        'link' => $row['link'],
        'quantity' => $row['quantity']
    ]));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $res = json_decode(curl_exec($ch), true);
    curl_close($ch);

    if (isset($res['order'])) {
        $update = $pdo->prepare("UPDATE orders SET api_order_id = ?, status = 'In progress' WHERE id = ?");
        $update->execute([$res['order'], $row['id']]);
    }
}`;

  const statusCronSnippet = `<?php
// cron/status.php - Run every 2 minutes via cPanel Cron
$pdo = new PDO("mysql:host=localhost;dbname=smm_panel;charset=utf8mb4", "smm_user", "password");

$sql = "SELECT o.id, o.user_id, o.charge, o.quantity, o.api_order_id, p.url, p.api_key
        FROM orders o
        JOIN api_providers p ON o.api_provider_id = p.id
        WHERE o.status IN ('In progress', 'Processing', 'Pending') AND o.api_order_id IS NOT NULL
        LIMIT 50";

foreach ($pdo->query($sql) as $row) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $row['url']);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'key' => $row['api_key'],
        'action' => 'status',
        'order' => $row['api_order_id']
    ]));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $res = json_decode(curl_exec($ch), true);
    curl_close($ch);

    if (isset($res['status'])) {
        $st = ucfirst(strtolower($res['status']));
        $remains = (int)($res['remains'] ?? 0);
        $start = (int)($res['start_count'] ?? 0);
        
        // Auto-refund on cancel
        if (in_array(strtolower($st), ['canceled', 'refunded'])) {
            $pdo->prepare("UPDATE users SET balance = balance + ? WHERE id = ?")->execute([$row['charge'], $row['user_id']]);
        }
        
        $pdo->prepare("UPDATE orders SET status = ?, start_count = ?, remains = ? WHERE id = ?")
            ->execute([$st, $start, $remains, $row['id']]);
    }
}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-400" />
          Production Deployment & Database Schema
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Complete downloadable MySQL architecture, PHP cron jobs, and cPanel configuration steps.
        </p>
      </div>

      {/* Download Action Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Schema SQL */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold">
              <Database className="w-4 h-4" />
              schema.sql
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Full MySQL tables, triggers, foreign keys, and default seed records.
            </p>
          </div>
          <a
            href="/schema.sql"
            download="schema.sql"
            className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Download schema.sql
          </a>
        </div>

        {/* Orders Cron */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold">
              <FileCode className="w-4 h-4" />
              cron/orders.php
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Forwards pending client orders to external SMM API providers automatically.
            </p>
          </div>
          <a
            href="/cron/orders.php"
            download="orders.php"
            className="w-full py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Download orders.php
          </a>
        </div>

        {/* Status Cron */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
              <Terminal className="w-4 h-4" />
              cron/status.php
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Syncs external order progress, start counts, remains, and auto refunds.
            </p>
          </div>
          <a
            href="/cron/status.php"
            download="status.php"
            className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Download status.php
          </a>
        </div>
      </div>

      {/* Step by Step cPanel Setup Guide */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-purple-400" />
          Step-by-Step cPanel / Apache / Nginx Installation Instructions
        </h3>

        <div className="space-y-4 text-xs">
          {/* Step 1 */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="font-bold text-white text-sm">Step 1: Create Database & User in cPanel</span>
            <p className="text-slate-400 mt-1 leading-relaxed">
              Log in to your cPanel &rarr; Click <b>MySQL Databases</b> &rarr; Create a new database named e.g. <code className="text-indigo-300">smm_panel_db</code> &rarr; Create a database user &rarr; Assign the user to the database with <b>ALL PRIVILEGES</b>.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="font-bold text-white text-sm">Step 2: Import schema.sql into phpMyAdmin</span>
            <p className="text-slate-400 mt-1 leading-relaxed">
              Open <b>phpMyAdmin</b> from cPanel &rarr; Select your new database &rarr; Click the <b>Import</b> tab &rarr; Choose the downloaded <code className="text-indigo-300">schema.sql</code> file &rarr; Click <b>Go</b>. All tables, seed services, and admin accounts will be generated.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="font-bold text-white text-sm">Step 3: Setup Automated Cron Jobs in cPanel</span>
            <p className="text-slate-400 mt-1 leading-relaxed">
              In cPanel, click <b>Cron Jobs</b>. Add these two scheduled tasks so your panel automatically forwards orders to providers:
            </p>

            <div className="mt-3 space-y-2">
              <div>
                <span className="text-slate-400 text-[11px] block font-semibold mb-1">
                  1. Order Forwarding Cron (Runs Every 1 Minute):
                </span>
                <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-purple-300">
                  <span>* * * * * /usr/bin/php /home/USERNAME/public_html/cron/orders.php &gt;/dev/null 2&gt;&amp;1</span>
                  <button
                    onClick={() => copyCode('* * * * * /usr/bin/php /home/USERNAME/public_html/cron/orders.php >/dev/null 2>&1', 'cron1')}
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white ml-2"
                  >
                    {copiedKey === 'cron1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block font-semibold mb-1">
                  2. Order Status Sync Cron (Runs Every 2 Minutes):
                </span>
                <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-300">
                  <span>*/2 * * * * /usr/bin/php /home/USERNAME/public_html/cron/status.php &gt;/dev/null 2&gt;&amp;1</span>
                  <button
                    onClick={() => copyCode('*/2 * * * * /usr/bin/php /home/USERNAME/public_html/cron/status.php >/dev/null 2>&1', 'cron2')}
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white ml-2"
                  >
                    {copiedKey === 'cron2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="font-bold text-white text-sm">Step 4: Pakistan Local Gateways (EasyPaisa / JazzCash)</span>
            <p className="text-slate-400 mt-1 leading-relaxed">
              When users deposit via EasyPaisa or JazzCash, submissions arrive in <b>Payment Approvals</b>. You verify the TRX ID on your phone and click <b>Approve</b>. The script will immediately credit the customer's balance and log an audit timestamp!
            </p>
          </div>
        </div>
      </div>

      {/* Code Inspector Tabs */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveFile('sql')}
              className={`px-3 py-1 rounded text-xs font-semibold ${
                activeFile === 'sql' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              schema.sql Preview
            </button>
            <button
              onClick={() => setActiveFile('orders_cron')}
              className={`px-3 py-1 rounded text-xs font-semibold ${
                activeFile === 'orders_cron' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              cron/orders.php Preview
            </button>
            <button
              onClick={() => setActiveFile('status_cron')}
              className={`px-3 py-1 rounded text-xs font-semibold ${
                activeFile === 'status_cron' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              cron/status.php Preview
            </button>
          </div>

          <button
            onClick={() => {
              const code = activeFile === 'sql' ? sqlSnippet : activeFile === 'orders_cron' ? ordersCronSnippet : statusCronSnippet;
              copyCode(code, 'code_preview');
            }}
            className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1"
          >
            {copiedKey === 'code_preview' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            Copy Content
          </button>
        </div>

        <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-72 leading-relaxed">
          {activeFile === 'sql' && sqlSnippet}
          {activeFile === 'orders_cron' && ordersCronSnippet}
          {activeFile === 'status_cron' && statusCronSnippet}
        </pre>
      </div>
    </div>
  );
};
