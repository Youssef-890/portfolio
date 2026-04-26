<?php
/* =====================================================
   ADMIN DASHBOARD — Youssef El Amri Portfolio
   Password-protected view of messages + subscribers.
   Change API_ADMIN_PASSWORD in /api/config.php !
   ===================================================== */
require_once __DIR__ . '/../api/config.php';
session_start();

$err = '';
$action = $_POST['action'] ?? $_GET['action'] ?? '';

if ($action === 'login') {
    if (hash_equals(API_ADMIN_PASSWORD, (string)($_POST['password'] ?? ''))) {
        $_SESSION['admin'] = true;
    } else {
        $err = 'Wrong password.';
    }
}
if ($action === 'logout') {
    $_SESSION = [];
    session_destroy();
    header('Location: index.php');
    exit;
}

$isAdmin = !empty($_SESSION['admin']);

// Actions that require auth
if ($isAdmin) {
    if ($action === 'mark_read' && !empty($_POST['id'])) {
        $list = data_read('contacts', []);
        foreach ($list as &$m) { if ($m['id'] === $_POST['id']) $m['read'] = true; }
        data_write('contacts', $list);
        header('Location: index.php'); exit;
    }
    if ($action === 'delete_contact' && !empty($_POST['id'])) {
        $list = data_read('contacts', []);
        $list = array_values(array_filter($list, fn($m) => $m['id'] !== $_POST['id']));
        data_write('contacts', $list);
        header('Location: index.php'); exit;
    }
    if ($action === 'delete_sub' && !empty($_POST['id'])) {
        $list = data_read('newsletter', []);
        $list = array_values(array_filter($list, fn($m) => $m['id'] !== $_POST['id']));
        data_write('newsletter', $list);
        header('Location: index.php?tab=newsletter'); exit;
    }
}

$contacts  = $isAdmin ? data_read('contacts', [])    : [];
$subs      = $isAdmin ? data_read('newsletter', []) : [];
$visitors  = $isAdmin ? data_read('visitors', [])    : [];
$unread    = count(array_filter($contacts, fn($m) => empty($m['read'])));
$tab       = $_GET['tab'] ?? 'messages';
?>
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <title>Admin — Portfolio</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="../css/global.css" />
    <style>
      body { min-height: 100vh; padding: 40px 24px; }
      .admin-wrap { max-width: 1100px; margin: 0 auto; }
      .admin-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:28px; }
      .admin-header h1 { font-size:1.8rem; }
      .admin-tabs { display:flex; gap:8px; margin-bottom:24px; flex-wrap:wrap; }
      .admin-tab  { padding:10px 18px; border-radius:10px; background:var(--bg-card); border:1px solid var(--border-color); color:var(--text-secondary); font-weight:600; font-size:0.9rem; }
      .admin-tab.active { color:#fff; background:var(--gradient-primary); border-color:transparent; }
      .stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
      .stat-tile { background:var(--bg-card); border:1px solid var(--border-color); border-radius:14px; padding:18px; }
      .stat-tile .label { font-size:0.78rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; }
      .stat-tile .value { font-size:1.8rem; font-weight:800; background:var(--gradient-primary); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
      table { width:100%; border-collapse:collapse; background:var(--bg-card); border:1px solid var(--border-color); border-radius:14px; overflow:hidden; }
      th, td { padding:14px 16px; text-align:left; font-size:0.9rem; border-bottom:1px solid var(--border-color); }
      th { background:var(--bg-tertiary); font-weight:700; color:var(--text-primary); font-size:0.78rem; text-transform:uppercase; letter-spacing:1px; }
      tr:last-child td { border-bottom:0; }
      tr.unread td { background: rgba(108,99,255,0.07); }
      .dot { width:8px; height:8px; border-radius:50%; background:var(--primary); display:inline-block; margin-right:6px; }
      .msg-preview { color:var(--text-secondary); max-width:380px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .row-actions { display:flex; gap:6px; }
      .row-actions button { font-size:0.75rem; padding:6px 10px; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-tertiary); color:var(--text-secondary); cursor:pointer; }
      .row-actions button:hover { color:#fff; background:var(--primary); border-color:var(--primary); }
      .row-actions .danger:hover { background:#e74c3c; border-color:#e74c3c; }
      .login-box { max-width:420px; margin:15vh auto 0; padding:40px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:20px; box-shadow:var(--shadow); }
      .login-box h1 { font-size:1.5rem; margin-bottom:8px; }
      .login-box p { font-size:0.9rem; margin-bottom:24px; }
      .err { background:rgba(231,76,60,0.15); border:1px solid rgba(231,76,60,0.35); color:#fca5a5; padding:10px 14px; border-radius:10px; margin-bottom:16px; font-size:0.88rem; }
      details { background:var(--bg-tertiary); border-radius:8px; padding:8px 12px; margin-top:8px; }
      details summary { cursor:pointer; font-size:0.82rem; color:var(--primary); }
      details pre { white-space:pre-wrap; font-family:var(--font-body); font-size:0.88rem; color:var(--text-secondary); margin-top:8px; }
      @media (max-width:780px) { .stats-row { grid-template-columns:repeat(2,1fr); } .msg-preview { display:none; } }
    </style>
</head>
<body data-language="en">
<div class="admin-wrap">

<?php if (!$isAdmin): ?>

  <div class="login-box">
    <h1><i class="fas fa-lock" style="color:var(--primary)"></i> Admin Login</h1>
    <p>Enter the admin password to view the dashboard.</p>
    <?php if ($err): ?><div class="err"><?= htmlspecialchars($err) ?></div><?php endif; ?>
    <form method="post">
      <input type="hidden" name="action" value="login" />
      <div class="form-group">
        <label class="form-label">Password</label>
        <input type="password" name="password" class="form-control" required autofocus />
      </div>
      <button type="submit" class="btn btn-primary w-full">
        <i class="fas fa-sign-in-alt"></i> Login
      </button>
    </form>
    <p style="margin-top:18px; font-size:0.78rem; color:var(--text-muted)">
      Tip: change the password in <code>api/config.php</code>.
    </p>
  </div>

<?php else: ?>

  <div class="admin-header">
    <h1><i class="fas fa-chart-line" style="color:var(--primary)"></i> Admin Dashboard</h1>
    <form method="post" style="display:inline">
      <input type="hidden" name="action" value="logout" />
      <button class="btn btn-outline btn-sm"><i class="fas fa-sign-out-alt"></i> Logout</button>
    </form>
  </div>

  <div class="stats-row">
    <div class="stat-tile"><div class="label">Messages</div><div class="value"><?= count($contacts) ?></div></div>
    <div class="stat-tile"><div class="label">Unread</div><div class="value"><?= $unread ?></div></div>
    <div class="stat-tile"><div class="label">Subscribers</div><div class="value"><?= count($subs) ?></div></div>
    <div class="stat-tile"><div class="label">Visitors</div><div class="value"><?= (int)($visitors['total'] ?? 0) ?></div></div>
  </div>

  <div class="admin-tabs">
    <a href="?tab=messages"   class="admin-tab <?= $tab==='messages'?'active':'' ?>"><i class="fas fa-envelope"></i> Messages (<?= count($contacts) ?>)</a>
    <a href="?tab=newsletter" class="admin-tab <?= $tab==='newsletter'?'active':'' ?>"><i class="fas fa-bell"></i> Newsletter (<?= count($subs) ?>)</a>
  </div>

<?php if ($tab === 'messages'): ?>

  <?php if (!$contacts): ?>
    <p style="text-align:center;padding:60px;color:var(--text-muted)">No messages yet.</p>
  <?php else: ?>
    <table>
      <thead><tr><th>Date</th><th>From</th><th>Subject</th><th>Message</th><th></th></tr></thead>
      <tbody>
      <?php foreach ($contacts as $m): ?>
        <tr class="<?= empty($m['read']) ? 'unread' : '' ?>">
          <td><?= htmlspecialchars(date('M j, H:i', strtotime($m['created_at']))) ?></td>
          <td>
            <?php if (empty($m['read'])): ?><span class="dot"></span><?php endif; ?>
            <strong><?= htmlspecialchars($m['name']) ?></strong><br>
            <small style="color:var(--text-muted)"><a href="mailto:<?= htmlspecialchars($m['email']) ?>"><?= htmlspecialchars($m['email']) ?></a></small>
          </td>
          <td><?= htmlspecialchars($m['subject']) ?></td>
          <td>
            <div class="msg-preview"><?= htmlspecialchars(mb_strimwidth($m['message'],0,80,'…')) ?></div>
            <details><summary>Read full</summary><pre><?= htmlspecialchars($m['message']) ?></pre></details>
          </td>
          <td class="row-actions">
            <?php if (empty($m['read'])): ?>
              <form method="post" style="display:inline">
                <input type="hidden" name="action" value="mark_read" />
                <input type="hidden" name="id" value="<?= htmlspecialchars($m['id']) ?>" />
                <button type="submit" title="Mark as read"><i class="fas fa-check"></i></button>
              </form>
            <?php endif; ?>
            <form method="post" style="display:inline" onsubmit="return confirm('Delete message?')">
              <input type="hidden" name="action" value="delete_contact" />
              <input type="hidden" name="id" value="<?= htmlspecialchars($m['id']) ?>" />
              <button type="submit" class="danger" title="Delete"><i class="fas fa-trash"></i></button>
            </form>
          </td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  <?php endif; ?>

<?php else: ?>

  <?php if (!$subs): ?>
    <p style="text-align:center;padding:60px;color:var(--text-muted)">No subscribers yet.</p>
  <?php else: ?>
    <table>
      <thead><tr><th>Date</th><th>Email</th><th>Name</th><th></th></tr></thead>
      <tbody>
      <?php foreach (array_reverse($subs) as $s): ?>
        <tr>
          <td><?= htmlspecialchars(date('M j, Y', strtotime($s['created_at']))) ?></td>
          <td><a href="mailto:<?= htmlspecialchars($s['email']) ?>"><?= htmlspecialchars($s['email']) ?></a></td>
          <td><?= htmlspecialchars($s['name'] ?: '—') ?></td>
          <td class="row-actions">
            <form method="post" style="display:inline" onsubmit="return confirm('Remove subscriber?')">
              <input type="hidden" name="action" value="delete_sub" />
              <input type="hidden" name="id" value="<?= htmlspecialchars($s['id']) ?>" />
              <button type="submit" class="danger"><i class="fas fa-trash"></i></button>
            </form>
          </td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  <?php endif; ?>

<?php endif; ?>

<?php endif; ?>

</div>
</body>
</html>
