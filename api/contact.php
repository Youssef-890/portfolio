<?php
require_once __DIR__ . '/config.php';
api_cors();
api_require_method('POST');
rate_limit('contact');

$body = api_body();

// Honeypot — if set, silently pretend success (spam bots)
if (!empty($body['website']) || !empty($body['_hp'])) {
    api_ok(null, 'Thanks!');
}

$miss = v_required($body, ['name', 'email', 'subject', 'message']);
if ($miss) api_fail('Missing required fields', 422, ['missing' => $miss]);

$name    = v_string($body['name'], 120);
$email   = v_email($body['email']);
$subject = v_string($body['subject'], 200);
$message = v_string($body['message'], 5000);

if (!$email)               api_fail('Invalid email address', 422);
if (mb_strlen($message) < 10) api_fail('Message is too short', 422);
if (!v_nolinks($message))  api_fail('Message flagged as spam', 422);

$entry = [
    'id'         => new_id(),
    'name'       => $name,
    'email'      => $email,
    'subject'    => $subject,
    'message'    => $message,
    'ip'         => client_ip(),
    'user_agent' => v_string($_SERVER['HTTP_USER_AGENT'] ?? '', 255),
    'read'       => false,
    'created_at' => date('c'),
];

$all = data_read('contacts', []);
array_unshift($all, $entry);           // newest first
$all = array_slice($all, 0, 500);      // cap storage
data_write('contacts', $all);

// Optional: send email notification (requires PHP mail() configured)
$html = '<h3>New portfolio message</h3>' .
        '<p><strong>From:</strong> ' . htmlspecialchars($name) . ' &lt;' . htmlspecialchars($email) . '&gt;</p>' .
        '<p><strong>Subject:</strong> ' . htmlspecialchars($subject) . '</p>' .
        '<hr><p style="white-space:pre-wrap">' . nl2br(htmlspecialchars($message)) . '</p>';
send_mail(API_CONTACT_EMAIL, '[Portfolio] ' . $subject, $html, $email);

api_ok(['id' => $entry['id']], 'Message received. I will get back to you soon!');
