<?php
require_once __DIR__ . '/config.php';
api_cors();

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? '');
$state  = data_read('visitors', ['total' => 0, 'today' => 0, 'date' => date('Y-m-d'), 'unique_ips' => []]);

// Reset daily counter
if (($state['date'] ?? '') !== date('Y-m-d')) {
    $state['date']       = date('Y-m-d');
    $state['today']      = 0;
    $state['unique_ips'] = [];
}

if ($method === 'POST') {
    rate_limit('visitor', 30, 3600);  // at most 30 pings/hour per IP

    $ip  = client_ip();
    $hash = substr(hash('sha256', $ip), 0, 16);  // privacy-friendly hash
    $state['total'] = (int)($state['total'] ?? 0) + 1;

    // deduplicate same IP per day for "today" count
    $ips = $state['unique_ips'] ?? [];
    if (!in_array($hash, $ips, true)) {
        $ips[] = $hash;
        $state['today'] = count($ips);
        $state['unique_ips'] = array_slice($ips, -2000); // cap
    }
    data_write('visitors', $state);
}

api_ok([
    'total' => (int)($state['total'] ?? 0),
    'today' => (int)($state['today'] ?? 0),
    'date'  => $state['date'] ?? date('Y-m-d'),
]);
