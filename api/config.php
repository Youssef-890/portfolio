<?php
/* ================================================================
   API CONFIG — Youssef El Amri Portfolio
   Shared helpers: CORS, JSON I/O, validation, rate-limit, responses.
   ================================================================ */

// Sensible defaults
date_default_timezone_set('UTC');
mb_internal_encoding('UTF-8');
ini_set('default_charset', 'UTF-8');

// ---- Configuration (tweak as needed) ----
const API_ADMIN_PASSWORD = 'change-me-please';           // used by admin/ page
const API_CONTACT_EMAIL  = 'youssefelamri2004@gmail.com';   // where to forward messages
const API_SEND_MAIL      = false;                        // set true on production (needs mail() or SMTP)
const API_RATE_LIMIT     = 5;                            // requests
const API_RATE_WINDOW    = 600;                          // per N seconds (10 min)

// ---- Absolute paths ----
define('DATA_DIR', realpath(__DIR__ . '/../data') ?: __DIR__ . '/../data');
if (!is_dir(DATA_DIR)) { @mkdir(DATA_DIR, 0775, true); }

// ------------------------------------------------------------------
//  Response helpers
// ------------------------------------------------------------------
function api_cors(): void {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function api_json($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, max-age=0');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function api_ok($payload = null, string $message = 'OK'): void {
    api_json(['ok' => true, 'message' => $message, 'data' => $payload]);
}

function api_fail(string $message, int $code = 400, $extra = null): void {
    api_json(['ok' => false, 'message' => $message, 'errors' => $extra], $code);
}

function api_require_method(string $method): void {
    if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') !== strtoupper($method)) {
        api_fail("Method not allowed", 405);
    }
}

// ------------------------------------------------------------------
//  Body parsing — supports JSON and form-encoded
// ------------------------------------------------------------------
function api_body(): array {
    $raw = file_get_contents('php://input') ?: '';
    $ct  = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($ct, 'application/json') !== false) {
        $j = json_decode($raw, true);
        return is_array($j) ? $j : [];
    }
    // fall back to form fields
    return $_POST ?: [];
}

// ------------------------------------------------------------------
//  JSON storage with file-locking
// ------------------------------------------------------------------
function data_path(string $name): string {
    // only allow simple alphanumeric filenames
    if (!preg_match('/^[a-z0-9_-]+$/i', $name)) {
        api_fail('invalid data name', 400);
    }
    return DATA_DIR . DIRECTORY_SEPARATOR . $name . '.json';
}

function data_read(string $name, $default = []) {
    $p = data_path($name);
    if (!file_exists($p)) return $default;
    $raw = @file_get_contents($p);
    if ($raw === false || $raw === '') return $default;
    $json = json_decode($raw, true);
    return $json === null ? $default : $json;
}

function data_write(string $name, $data): bool {
    $p = data_path($name);
    $fp = fopen($p, 'c+');
    if (!$fp) return false;
    if (!flock($fp, LOCK_EX)) { fclose($fp); return false; }
    ftruncate($fp, 0);
    rewind($fp);
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    fwrite($fp, $json);
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return true;
}

// ------------------------------------------------------------------
//  Input validation / sanitisation
// ------------------------------------------------------------------
function v_string($v, int $max = 2000): string {
    if (!is_string($v)) $v = (string)$v;
    $v = trim($v);
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v); // strip control chars
    return mb_substr($v, 0, $max);
}

function v_email($v): ?string {
    $v = v_string($v, 254);
    return filter_var($v, FILTER_VALIDATE_EMAIL) ?: null;
}

function v_required(array $data, array $fields): array {
    $missing = [];
    foreach ($fields as $f) {
        if (!isset($data[$f]) || trim((string)$data[$f]) === '') $missing[] = $f;
    }
    return $missing;
}

function v_nolinks(string $s): bool {
    // reject messages that are clearly spam with too many URLs
    $count = preg_match_all('~https?://|www\.~i', $s);
    return $count <= 2;
}

// ------------------------------------------------------------------
//  Rate limiting (per IP, per endpoint)
// ------------------------------------------------------------------
function client_ip(): string {
    foreach (['HTTP_CF_CONNECTING_IP','HTTP_X_FORWARDED_FOR','REMOTE_ADDR'] as $h) {
        if (!empty($_SERVER[$h])) {
            $ip = explode(',', $_SERVER[$h])[0];
            return trim($ip);
        }
    }
    return '0.0.0.0';
}

function rate_limit(string $bucket, int $limit = API_RATE_LIMIT, int $window = API_RATE_WINDOW): void {
    $rl = data_read('rate_limit', []);
    $ip = client_ip();
    $now = time();
    $key = $bucket . '|' . $ip;

    $entries = $rl[$key] ?? [];
    // drop expired
    $entries = array_values(array_filter($entries, fn($t) => ($now - $t) < $window));

    if (count($entries) >= $limit) {
        api_fail('Too many requests. Please try again later.', 429);
    }
    $entries[] = $now;
    $rl[$key] = $entries;

    // garbage-collect ~1% of the time
    if (random_int(0, 99) === 0) {
        foreach ($rl as $k => $times) {
            $rl[$k] = array_values(array_filter($times, fn($t) => ($now - $t) < $window));
            if (empty($rl[$k])) unset($rl[$k]);
        }
    }
    data_write('rate_limit', $rl);
}

// ------------------------------------------------------------------
//  Simple uuid / id
// ------------------------------------------------------------------
function new_id(): string {
    try {
        $b = random_bytes(8);
    } catch (Throwable $e) {
        $b = openssl_random_pseudo_bytes(8);
    }
    return bin2hex($b);
}

// ------------------------------------------------------------------
//  Mail helper (optional)
// ------------------------------------------------------------------
function send_mail(string $to, string $subject, string $html, ?string $replyTo = null): bool {
    if (!API_SEND_MAIL) return true; // silently succeed when disabled
    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Portfolio <no-reply@" . ($_SERVER['HTTP_HOST'] ?? 'localhost') . ">\r\n";
    if ($replyTo) $headers .= "Reply-To: $replyTo\r\n";
    return @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $html, $headers);
}
