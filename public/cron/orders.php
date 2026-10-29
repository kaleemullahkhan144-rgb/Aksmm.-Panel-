<?php
/**
 * Cheap Pak Panel (cheappakpanel.com) - Production Cron: Forward Pending Orders to API Providers
 * Setup in cPanel Cron Jobs to run every minute:
 * * * * * * /usr/bin/php /home/USERNAME/public_html/cron/orders.php >/dev/null 2>&1
 */

// Database Connection
$db_host = 'localhost';
$db_user = 'smm_user';
$db_pass = 'smm_secret_password';
$db_name = 'smm_panel_db';

try {
    $pdo = new PDO("mysql:host={$db_host};dbname={$db_name};charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    die("Database Connection Failed: " . $e->getMessage() . "\n");
}

echo "[" . date('Y-m-d H:i:s') . "] Starting Orders Forwarding Cron...\n";

// Fetch pending orders that are assigned to an API provider and have not yet been sent
$sql = "SELECT o.id, o.service_id, o.link, o.quantity, o.runs, o.interval,
               s.api_service_id, p.id AS provider_id, p.url AS provider_url, p.api_key AS provider_key
        FROM orders o
        JOIN services s ON o.service_id = s.id
        JOIN api_providers p ON s.api_provider_id = p.id
        WHERE o.status = 'Pending' AND (o.api_order_id IS NULL OR o.api_order_id = '')
        LIMIT 50";

$stmt = $pdo->query($sql);
$orders = $stmt->fetchAll();

if (empty($orders)) {
    echo "No pending orders to forward.\n";
    exit;
}

echo "Found " . count($orders) . " orders to send to API providers.\n";

foreach ($orders as $order) {
    echo "Processing Order #{$order['id']} (Provider Service #{$order['api_service_id']})...\n";

    $post_data = [
        'key' => $order['provider_key'],
        'action' => 'add',
        'service' => $order['api_service_id'],
        'link' => $order['link'],
        'quantity' => $order['quantity']
    ];

    if (!empty($order['runs']) && $order['runs'] > 1) {
        $post_data['runs'] = $order['runs'];
        $post_data['interval'] = $order['interval'];
    }

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $order['provider_url']);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    $curl_error = curl_error($ch);
    curl_close($ch);

    if ($curl_error) {
        echo "cURL Error for Order #{$order['id']}: {$curl_error}\n";
        continue;
    }

    $result = json_decode($response, true);

    if (isset($result['order'])) {
        // Success: Store the provider order ID and advance status to 'In progress'
        $ext_order_id = $result['order'];
        $update = $pdo->prepare("UPDATE orders SET api_provider_id = ?, api_order_id = ?, status = 'In progress', updated_at = NOW() WHERE id = ?");
        $update->execute([$order['provider_id'], $ext_order_id, $order['id']]);
        echo "Order #{$order['id']} successfully sent! External ID: {$ext_order_id}\n";
    } elseif (isset($result['error'])) {
        // API returned an error (e.g., Not enough balance, link invalid)
        $error_msg = substr($result['error'], 0, 60);
        echo "Provider Error for Order #{$order['id']}: {$error_msg}\n";
        $update = $pdo->prepare("UPDATE orders SET api_status = ?, updated_at = NOW() WHERE id = ?");
        $update->execute(["Error: " . $error_msg, $order['id']]);
    } else {
        echo "Unexpected response for Order #{$order['id']}: {$response}\n";
    }
}

echo "[" . date('Y-m-d H:i:s') . "] Orders Forwarding Cron Finished.\n";
