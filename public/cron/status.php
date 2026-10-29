<?php
/**
 * Cheap Pak Panel (cheappakpanel.com) - Production Cron: Sync Order Statuses from API Providers
 * Setup in cPanel Cron Jobs to run every 2 minutes:
 * * /2 * * * * /usr/bin/php /home/USERNAME/public_html/cron/status.php >/dev/null 2>&1
 */

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

echo "[" . date('Y-m-d H:i:s') . "] Starting Status Sync Cron...\n";

// Fetch active orders with an external API order ID
$sql = "SELECT o.id, o.user_id, o.charge, o.quantity, o.api_order_id, p.id AS provider_id, p.url AS provider_url, p.api_key AS provider_key
        FROM orders o
        JOIN api_providers p ON o.api_provider_id = p.id
        WHERE o.status IN ('In progress', 'Processing', 'Pending') 
          AND o.api_order_id IS NOT NULL 
          AND o.api_order_id != ''
        LIMIT 50";

$stmt = $pdo->query($sql);
$orders = $stmt->fetchAll();

if (empty($orders)) {
    echo "No active orders to sync.\n";
    exit;
}

echo "Found " . count($orders) . " orders to check with providers.\n";

foreach ($orders as $order) {
    $post_data = [
        'key' => $order['provider_key'],
        'action' => 'status',
        'order' => $order['api_order_id']
    ];

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

    if (isset($result['status'])) {
        $raw_status = strtolower(trim($result['status']));
        $start_count = isset($result['start_count']) ? (int)$result['start_count'] : 0;
        $remains = isset($result['remains']) ? (int)$result['remains'] : 0;
        
        // Map to standard internal statuses
        $new_status = 'In progress';
        if (in_array($raw_status, ['completed', 'complete'])) {
            $new_status = 'Completed';
            $remains = 0;
        } elseif (in_array($raw_status, ['processing'])) {
            $new_status = 'Processing';
        } elseif (in_array($raw_status, ['partial', 'partially completed'])) {
            $new_status = 'Partial';
            // Trigger automatic refund for remainder
            if ($order['quantity'] > 0 && $remains > 0) {
                $refund_ratio = $remains / $order['quantity'];
                $refund_amount = round($order['charge'] * $refund_ratio, 4);
                if ($refund_amount > 0) {
                    $refund_stmt = $pdo->prepare("UPDATE users SET balance = balance + ?, spent = spent - ? WHERE id = ?");
                    $refund_stmt->execute([$refund_amount, $refund_amount, $order['user_id']]);
                    echo "Auto-refunded \${$refund_amount} to User #{$order['user_id']} for partial order #{$order['id']}.\n";
                }
            }
        } elseif (in_array($raw_status, ['canceled', 'cancelled', 'refunded'])) {
            $new_status = 'Canceled';
            // Full refund to user balance
            $refund_stmt = $pdo->prepare("UPDATE users SET balance = balance + ?, spent = spent - ? WHERE id = ?");
            $refund_stmt->execute([$order['charge'], $order['charge'], $order['user_id']]);
            echo "Full refund of \${$order['charge']} issued to User #{$order['user_id']} for canceled order #{$order['id']}.\n";
        }

        $update = $pdo->prepare("UPDATE orders SET status = ?, start_count = ?, remains = ?, api_status = ?, updated_at = NOW() WHERE id = ?");
        $update->execute([$new_status, $start_count, $remains, $raw_status, $order['id']]);

        echo "Updated Order #{$order['id']} -> Status: {$new_status}, Remains: {$remains}\n";
    }
}

echo "[" . date('Y-m-d H:i:s') . "] Status Sync Cron Finished.\n";
