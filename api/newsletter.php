<?php
require_once __DIR__ . '/config.php';
api_cors();

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? '');

// GET — return subscriber count (not the list)
if ($method === 'GET') {
    $subs = data_read('newsletter', []);
    api_ok(['count' => count($subs)]);
}

api_require_method('POST');
rate_limit('newsletter');

$body  = api_body();
$email = v_email($body['email'] ?? '');
$name  = v_string($body['name'] ?? '', 120);

if (!$email) api_fail('Please enter a valid email address', 422);

$subs = data_read('newsletter', []);
foreach ($subs as $s) {
    if (strcasecmp($s['email'], $email) === 0) {
        api_ok(['count' => count($subs)], 'You are already subscribed.');
    }
}

$subs[] = [
    'id'         => new_id(),
    'email'      => $email,
    'name'       => $name,
    'ip'         => client_ip(),
    'created_at' => date('c'),
];
data_write('newsletter', $subs);

api_ok(['count' => count($subs)], 'Thanks! You are now subscribed.');
