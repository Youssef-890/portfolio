# Youssef El Amri — Portfolio

A modern, multilingual portfolio built with **HTML / CSS / Vanilla JS** on the
frontend and a lightweight **PHP + JSON** backend for the dynamic parts
(contact form, newsletter, visitor counter, admin dashboard).

---

## ✨ Features

### Frontend
- Responsive, "pro" design with mesh backgrounds, gradient borders, magnetic
  buttons, shimmer text, custom cursor and more.
- **AOS** (Animate On Scroll) animations, Swiper testimonials, parallax hero.
- **Command palette** (`Ctrl` / `⌘` + `K`) for keyboard-first navigation.
- **3 languages**: English · Français · Español. Toggle button cycles
  **EN → FR → ES → EN** (persisted in `localStorage`).
- Dark / light theme, persisted across sessions (no flash on load).
- Copy-to-clipboard, toast notifications, modals, tooltips, tilt cards.
- Accessibility: `aria-label`s, `prefers-reduced-motion`, keyboard navigation.

### Backend (PHP)
- **Contact form** → saves messages to JSON + optional email notification.
- **Newsletter** → stores subscribers, dedupes by email, live count on page.
- **Visitor counter** → total + daily unique (privacy-friendly hashed IPs).
- **Projects** / **Testimonials** JSON APIs (seeded on first request).
- **Admin dashboard** at `/admin/` with password protection.
- Rate-limiting + honeypot spam protection + `.htaccess` data lock-down.

---

## 📁 Project Structure

```
PORTFOLIO/
├── index.html          # Home
├── about.html / skills.html / projects.html / ...
├── css/
│   ├── global.css      # shared (theme, layout, components, i18n rules)
│   └── home.css        # home-page specific
├── js/
│   ├── global.js       # shared (theme, language, palette, API wiring)
│   ├── home.js         # home-page specific (particles, parallax)
│   └── contact.js      # contact page
├── api/                # PHP endpoints
│   ├── config.php      # shared helpers (CORS, JSON I/O, validation)
│   ├── contact.php     # POST — submit contact form
│   ├── newsletter.php  # POST — subscribe · GET — count
│   ├── visitors.php    # POST — ping · GET — counts
│   ├── projects.php    # GET — projects data
│   ├── testimonials.php# GET — testimonials data
│   └── .htaccess       # security headers
├── data/               # JSON storage (auto-created on first write)
│   └── .htaccess       # deny ALL web access
└── admin/
    └── index.php       # password-protected dashboard
```

---

## 🚀 Running Locally

Any PHP-capable server works. The simplest option:

```bash
# from the PORTFOLIO/ folder
php -S localhost:8000
```

Then open [http://localhost:8000](http://localhost:8000).

### XAMPP / MAMP / WAMP
Drop the `PORTFOLIO/` folder inside `htdocs/` (or your web root) and browse to
`http://localhost/PORTFOLIO/`.

### Production hosting
Any shared PHP host (Hostinger, Infomaniak, OVH, …) works. Just make sure:
1. PHP ≥ 7.4 is available.
2. The `data/` folder is writable by the web server.
3. Apache's `mod_rewrite` / `mod_authz_core` are enabled (used by the
   `.htaccess` rules that hide `data/`).

---

## ⚙️ Configuration

All settings live at the top of **`api/config.php`**:

```php
const API_ADMIN_PASSWORD = 'change-me-please'; // ← change before deploying!
const API_CONTACT_EMAIL  = 'youssefelamri2004@gmail.com';
const API_SEND_MAIL      = false; // set true in production
const API_RATE_LIMIT     = 5;     // requests
const API_RATE_WINDOW    = 600;   // per 10 minutes
```

- **Admin password** → used for `/admin/` login.
- **Email notifications** → set `API_SEND_MAIL = true` only if your server has
  `mail()` configured (most shared hosts do).

---

## 🔐 Admin Dashboard

Visit **`/admin/`** and log in with the password above to see:

- All contact-form messages (mark as read, delete).
- Newsletter subscribers list (unsubscribe).
- Total visitor stats.

The `data/contacts.json`, `data/newsletter.json`, etc. files are automatically
protected from direct HTTP access by the `.htaccess` in `data/`.

---

## 🌐 Adding Another Language

All language-aware text uses `data-lang="xx"` markers. To add a new language,
three small changes:

1. Append the code to `LANGS` in `js/global.js`:

   ```js
   const LANGS = ['en', 'fr', 'es', 'de'];
   LANG_META.de = { label: 'DE', toastNext: 'Sprache: Deutsch', switchTo: 'Sprache wechseln' };
   ```

2. Add matching selectors in `css/global.css` section 24 so other languages hide
   when `body[data-language="de"]`.

3. Add `<span data-lang="de">…</span>` blocks alongside the existing
   `en` / `fr` / `es` ones in the HTML.

---

## 📡 API Reference

Base URL: `/api/` (relative to site root).
All endpoints return `{ ok: boolean, message: string, data: any }`.

| Method | Endpoint                     | Purpose                          |
|--------|------------------------------|----------------------------------|
| POST   | `contact.php`                | Submit contact form              |
| GET    | `newsletter.php`             | Get subscriber count             |
| POST   | `newsletter.php`             | Subscribe an email               |
| GET    | `visitors.php`               | Read visitor counts              |
| POST   | `visitors.php`               | Increment visitor counter        |
| GET    | `projects.php`               | List projects (supports filters) |
| GET    | `testimonials.php`           | List testimonials                |

### Example — subscribe

```bash
curl -X POST https://yoursite.com/api/newsletter.php \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com"}'
```

---

## 🛡️ Security Notes

- All user input is validated server-side (`v_string`, `v_email`, length
  limits, control-char stripping).
- Rate limiting per IP (stored in `data/rate_limit.json`).
- Honeypot field in the contact form catches most bots.
- Messages with >2 URLs are rejected as likely spam.
- Storage files are denied direct web access.
- Admin page uses session + constant-time password comparison.

---

## 📝 License

Personal portfolio — © Youssef El Amri.
