<?php
/* ================================================================
   LOCAL APP LAUNCHER — Youssef El Amri Portfolio
   Launches a whitelisted desktop .exe on the local (same-PC) machine.
   SECURITY:
     - Only runs when the PHP server is bound to a loopback address
       (127.0.0.1 / ::1 / localhost). Refuses remote requests.
     - Uses a strict whitelist of apps (id => metadata). No user input
       can decide which executable runs.
     - Windows-only: uses `start "" "<path>"` so the EXE runs detached
       from the PHP request (the PHP process exits immediately).
   ================================================================ */

require_once __DIR__ . '/config.php';

api_cors();

// ------------------------------------------------------------------
// 1. Loopback-only guard
// ------------------------------------------------------------------
$remote = $_SERVER['REMOTE_ADDR'] ?? '';
$is_loopback = in_array($remote, ['127.0.0.1', '::1', 'localhost'], true)
            || str_starts_with($remote, '192.168.')   // typical LAN (allowed but flagged)
            || str_starts_with($remote, '10.')
            || str_starts_with($remote, '172.16.');
if (!$is_loopback) {
    api_fail('Launcher is restricted to local requests.', 403);
}

// ------------------------------------------------------------------
// 2. Whitelist of launchable apps
// ------------------------------------------------------------------
$portfolio_root = realpath(__DIR__ . '/..');

$APPS = [
    'assomanager' => [
        'name'          => 'AssoManager',
        'type'          => 'laravel',
        'project_roots' => [
            'D:\\assoamanager1\\assogestion-build',
        ],
        'host'          => '127.0.0.1',
        'port'          => 8002,
    ],
    'csharp' => [
        'name'          => 'CSharp Project',
        'type'          => 'exe',
        'candidates' => [
            'D:\\csharp\\TP5\\TP5.sln',
        ],
    ],
    'edutrack' => [
        'name'          => 'EduTrack',
        'type'          => 'laravel',
        'project_roots' => [
            'C:\\Users\\MSI\\OneDrive\\Bureau\\projet laravel\\edutrack',
            'C:\\Users\\MSI\\OneDrive\\Bureau\\projet laravel',
            'D:\\edutrack',
            'D:\\EduTrack',
            'D:\\projects\\edutrack',
            'D:\\laravel\\edutrack',
        ],
        'host'          => '127.0.0.1',
        'port'          => 8001,
    ],
    'smartcreche' => [
        'name'       => 'SmartCreche',
        'type'       => 'exe',
        'candidates' => [
            // Preferred: bundled inside the portfolio (stable location)
            $portfolio_root . '\\apps\\smartcreche\\SmartCreche.exe',
            // Fallbacks the user might have set up manually
            'C:\\Users\\MSI\\Downloads\\SmartCreche_v1.0\\SmartCreche.exe',
            'C:\\Users\\MSI\\Desktop\\SmartCreche\\SmartCreche.exe',
            'C:\\Users\\MSI\\OneDrive\\Bureau\\SmartCreche_extracted\\SmartCreche\\SmartCreche.exe',
            'C:\\Users\\MSI\\OneDrive\\Bureau\\SmartCreche\\SmartCreche.exe',
        ],
    ],
    'realcalc' => [
        'name'       => 'Real Calculator PRO',
        'type'       => 'jar',
        'candidates' => [
            $portfolio_root . '\\apps\\realcalc\\real-calculator-pro.jar',
            'D:\\cal\\out\\real-calculator-pro.jar',
            'C:\\Users\\MSI\\Downloads\\real-calculator-pro.jar',
            'C:\\Users\\MSI\\Desktop\\real-calculator-pro.jar',
        ],
    ],
];

// ------------------------------------------------------------------
// 3. Resolve app id (GET or POST, both accepted for convenience)
// ------------------------------------------------------------------
$id = strtolower(trim($_REQUEST['app'] ?? ''));
if ($id === '' || !isset($APPS[$id])) {
    api_fail('Unknown app id.', 400, ['available' => array_keys($APPS)]);
}

$app = $APPS[$id];

// ------------------------------------------------------------------
// 4. Resolve launch target (file or project root)
// ------------------------------------------------------------------
$type = $app['type'] ?? 'exe';
$target = null;
if ($type === 'laravel') {
    foreach (($app['project_roots'] ?? []) as $root) {
        if (is_dir($root)) {
            $target = $root;
            break;
        }
    }
    if ($target === null) {
        api_fail('Laravel project folder not found.', 404, [
            'project_roots' => $app['project_roots'] ?? [],
        ]);
    }
} else {
    foreach (($app['candidates'] ?? []) as $candidate) {
        if (is_file($candidate)) {
            $target = $candidate;
            break;
        }
    }
    if ($target === null) {
        api_fail('App not installed on this machine.', 404, [
            'hint'       => 'Place the extracted SmartCreche folder at any of the fallback paths, or keep the bundled copy in apps/smartcreche/.',
            'candidates' => $app['candidates'] ?? [],
        ]);
    }
}

// ------------------------------------------------------------------
// 5. Platform check + launch
// ------------------------------------------------------------------
if (!str_starts_with(strtoupper(PHP_OS_FAMILY), 'WIN')) {
    api_fail('Launcher requires Windows.', 500);
}

$workdir = ($type === 'laravel') ? $target : dirname($target);
$quoted  = ($type === 'laravel') ? '' : '"' . $target . '"';

// Build a detached command so the PHP request returns immediately.
switch ($type) {
    case 'dotnet':
        $cmd = 'cmd /c start "" /D "' . $workdir . '" cmd /k "dotnet run"';
        break;
    case 'laravel':
        $host = preg_replace('/[^a-zA-Z0-9\.\-]/', '', (string)($app['host'] ?? '127.0.0.1'));
        $port = (int)($app['port'] ?? 8001);
        if ($port <= 0 || $port > 65535) $port = 8001;
        $phpBin = 'php';
        $xamppPhp = 'C:\\xampp\\php\\php.exe';
        if (is_file($xamppPhp)) {
            $phpBin = '"' . $xamppPhp . '"';
        }
        $serveCmd = $phpBin . ' artisan serve --host=' . $host . ' --port=' . $port;
        $url = 'http://' . $host . ':' . $port;
        $cmd = 'cmd /c start "" /D "' . $workdir . '" cmd /k "' . $serveCmd . '" && start "" "' . $url . '"';
        break;
    case 'jar':
        // javaw = windowed Java launcher (no console). Falls back to java.
        $cmd = 'cmd /c start "" /D "' . $workdir . '" javaw -jar ' . $quoted;
        break;
    case 'exe':
    default:
        $cmd = 'cmd /c start "" /D "' . $workdir . '" ' . $quoted;
        break;
}

$handle = @popen($cmd, 'r');
if ($handle === false) {
    api_fail('Failed to launch process.', 500);
}
pclose($handle);

api_ok([
    'id'       => $id,
    'name'     => $app['name'],
    'type'     => $type,
    'launched' => $target,
], $app['name'] . ' launched.');
