/* ============================================================
   GLOBAL JS - Youssef El Amri Portfolio (PRO EDITION)
   ----------------------------------------------------------------
   - Loader with progress
   - Navbar (scroll, active link, hamburger)
   - Theme toggle (dark / light) with smooth transition
   - Language toggle (EN / FR) — class based, bug-free
   - Scroll-to-top & scroll progress bar
   - Custom dual-ring cursor + magnetic buttons
   - Toast notifications
   - Modals
   - Typing animation
   - Counter + progress-bar reveal
   - Command palette (Ctrl/Cmd + K)
   - Copy-to-clipboard (data-copy)
   - Konami-code easter egg (confetti)
   - Split text reveal on scroll
   - AOS init, smooth anchors, tilt cards
   ============================================================ */

(function () {
  'use strict';

  /* Pre-DOM: apply saved theme ASAP to avoid flash of wrong UI.
     (Language is applied below on DOMContentLoaded via applyLanguage.) */
  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
  const savedLang  = localStorage.getItem('portfolio-lang')  || 'en';
  document.documentElement.setAttribute('data-theme', savedTheme);

  document.addEventListener('DOMContentLoaded', () => {

    /* ============================================================
       1. LOADER  (id="loader" OR .loader fallback)
       ============================================================ */
    const loader = document.getElementById('loader') || document.querySelector('.loader');
    if (loader) {
      const hideLoader = () => {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 600);
      };
      // Hide after `load` event — but also set a max timeout so a failed
      // asset never leaves the overlay stuck on top of the page.
      let hidden = false;
      const safeHide = () => { if (!hidden) { hidden = true; hideLoader(); } };
      window.addEventListener('load', () => setTimeout(safeHide, 900));
      setTimeout(safeHide, 3500);  // hard fallback
    }

    /* ============================================================
       2. NAVBAR SCROLL
       ============================================================ */
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      const onScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 30);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    /* ============================================================
       3. HAMBURGER MOBILE MENU
       ============================================================ */
    const hamburger  = document.getElementById('hamburger') || document.querySelector('.navbar-hamburger');
    const mobileMenu = document.getElementById('mobileMenu') || document.querySelector('.navbar-mobile');

    if (hamburger && mobileMenu) {
      const closeMenu = () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      };

      hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = mobileMenu.classList.toggle('open');
        hamburger.classList.toggle('active', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
      document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) closeMenu();
      });
      window.addEventListener('resize', () => {
        if (window.innerWidth > 992) closeMenu();
      });
    }

    /* ============================================================
       4. ACTIVE NAV LINK
       ============================================================ */
    const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('.navbar-link').forEach(link => {
      const href = (link.getAttribute('href') || '').toLowerCase();
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    /* ============================================================
       5. THEME TOGGLE  (dark / light)
       ============================================================ */
    const themeToggles = document.querySelectorAll('.theme-toggle');
    const htmlEl = document.documentElement;
    const SETTINGS_KEY = 'portfolio-settings-v1';
    let userSettings = loadSettings();
    applySettings(userSettings);
    updateThemeIcons(htmlEl.getAttribute('data-theme') || 'dark');

    themeToggles.forEach(btn => {
      btn.addEventListener('click', () => {
        const next = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        htmlEl.setAttribute('data-theme', next);
        localStorage.setItem('portfolio-theme', next);
        updateThemeIcons(next);
        showToast(next === 'dark' ? 'Dark mode enabled' : 'Light mode enabled', 'info', 1800);
      });
    });

    function updateThemeIcons(theme) {
      themeToggles.forEach(btn => {
        const icon = btn.querySelector('i');
        if (!icon) return;
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        btn.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        btn.setAttribute('aria-label', btn.getAttribute('title'));
      });
    }

    function loadSettings() {
      const defaults = {
        reducedMotion: false,
        largeText: false,
        highContrast: false,
        hideCursor: false,
      };
      try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return defaults;
        const parsed = JSON.parse(raw);
        return { ...defaults, ...(parsed || {}) };
      } catch {
        return defaults;
      }
    }

    function saveSettings(next) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    }

    function applySettings(settings) {
      htmlEl.setAttribute('data-reduced-motion', settings.reducedMotion ? 'true' : 'false');
      htmlEl.setAttribute('data-font-scale', settings.largeText ? 'large' : 'normal');
      htmlEl.setAttribute('data-contrast', settings.highContrast ? 'high' : 'normal');
      htmlEl.setAttribute('data-cursor', settings.hideCursor ? 'off' : 'on');
    }

    function upsertSetting(key, value, toastMessage) {
      userSettings = { ...userSettings, [key]: value };
      applySettings(userSettings);
      saveSettings(userSettings);
      if (toastMessage) showToast(toastMessage, 'info', 1700);
    }

    /* ============================================================
       6. LANGUAGE PICKER  (dropdown: EN / FR / ES)
       -----------------------------------------------------------------
       The user clicks the button → a menu opens → they click the
       language they want. No more cycling.
       ============================================================ */
    const LANGS = ['en', 'fr', 'es'];
    const LANG_META = {
      en: { label: 'EN', name: 'English',  flag: '🇬🇧', toast: 'Language: English',  switchTo: 'Switch language' },
      fr: { label: 'FR', name: 'Français', flag: '🇫🇷', toast: 'Langue : Français',  switchTo: 'Changer de langue' },
      es: { label: 'ES', name: 'Español',  flag: '🇪🇸', toast: 'Idioma: Español',    switchTo: 'Cambiar idioma' },
    };

    const langToggles = document.querySelectorAll('.lang-toggle');
    const langDropdowns = [];

    // Wrap every .lang-toggle inside a dropdown container with a menu
    langToggles.forEach(btn => {
      // Avoid double-wrapping (if script runs twice for any reason)
      if (btn.parentElement && btn.parentElement.classList.contains('lang-dropdown')) return;

      const wrap = document.createElement('div');
      wrap.className = 'lang-dropdown';
      btn.parentNode.insertBefore(wrap, btn);
      wrap.appendChild(btn);
      btn.setAttribute('aria-haspopup', 'listbox');
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = `<span class="lang-current">EN</span><i class="fas fa-chevron-down lang-caret" aria-hidden="true"></i>`;

      const menu = document.createElement('ul');
      menu.className = 'lang-menu';
      menu.setAttribute('role', 'listbox');
      menu.innerHTML = LANGS.map(code => `
        <li role="option" data-lang-set="${code}" tabindex="0" aria-selected="false">
          <span class="lang-flag" aria-hidden="true">${LANG_META[code].flag}</span>
          <span class="lang-label">${LANG_META[code].name}</span>
          <span class="lang-code">${LANG_META[code].label}</span>
          <i class="fas fa-check lang-check" aria-hidden="true"></i>
        </li>
      `).join('');
      wrap.appendChild(menu);
      langDropdowns.push({ wrap, btn, menu });

      // Open/close on button click
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasOpen = wrap.classList.contains('open');
        // close any other open dropdown first
        langDropdowns.forEach(d => d.wrap.classList.remove('open'));
        if (!wasOpen) {
          wrap.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
          // focus the currently selected item
          const active = menu.querySelector('[aria-selected="true"]');
          (active || menu.firstElementChild)?.focus();
        } else {
          btn.setAttribute('aria-expanded', 'false');
        }
      });

      // Pick a language
      menu.addEventListener('click', (e) => {
        const li = e.target.closest('[data-lang-set]');
        if (!li) return;
        setLanguage(li.getAttribute('data-lang-set'));
        wrap.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      });

      // Keyboard navigation within menu
      menu.addEventListener('keydown', (e) => {
        const items = [...menu.querySelectorAll('[data-lang-set]')];
        const i = items.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length]?.focus(); }
        else if (e.key === 'ArrowUp')   { e.preventDefault(); items[(i - 1 + items.length) % items.length]?.focus(); }
        else if (e.key === 'Home')      { e.preventDefault(); items[0]?.focus(); }
        else if (e.key === 'End')       { e.preventDefault(); items[items.length - 1]?.focus(); }
        else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          document.activeElement?.click();
        } else if (e.key === 'Escape') {
          wrap.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
          btn.focus();
        }
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      langDropdowns.forEach(d => {
        if (!d.wrap.contains(e.target)) {
          d.wrap.classList.remove('open');
          d.btn.setAttribute('aria-expanded', 'false');
        }
      });
    });

    // Public API so the command-palette "Toggle language" still works
    window.setLanguage = setLanguage;

    // Apply initial language (from localStorage or fallback)
    setLanguage(LANGS.includes(savedLang) ? savedLang : 'en', /*silent*/ true);

    function setLanguage(lang, silent) {
      if (!LANGS.includes(lang)) lang = 'en';
      const current = document.body.getAttribute('data-language');
      document.body.setAttribute('data-language', lang);
      document.documentElement.setAttribute('lang', lang);
      localStorage.setItem('portfolio-lang', lang);

      // Update every dropdown button + menu state
      langDropdowns.forEach(({ btn, menu }) => {
        const labelEl = btn.querySelector('.lang-current');
        if (labelEl) labelEl.textContent = LANG_META[lang].label;
        btn.setAttribute('aria-label', LANG_META[lang].switchTo);
        btn.setAttribute('title',      LANG_META[lang].switchTo);
        menu.querySelectorAll('[data-lang-set]').forEach(li => {
          const active = li.getAttribute('data-lang-set') === lang;
          li.setAttribute('aria-selected', active ? 'true' : 'false');
          li.classList.toggle('active', active);
        });
      });

      if (!silent && current !== lang) {
        showToast(LANG_META[lang].toast, 'info', 1800);
      }
    }

    /* ============================================================
       6b. SETTINGS PANEL  (navbar gear button)
       ============================================================ */
    const settingsPanel = ensureSettingsPanel();
    attachSettingsButtons();
    syncSettingsPanelUi();

    function attachSettingsButtons() {
      document.querySelectorAll('.navbar-actions, .navbar-mobile-actions').forEach(container => {
        if (container.querySelector('.settings-toggle')) return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'settings-toggle';
        btn.setAttribute('title', 'Open settings');
        btn.setAttribute('aria-label', 'Open settings');
        btn.innerHTML = '<i class="fas fa-sliders-h" aria-hidden="true"></i>';
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          openSettingsPanel();
        });
        container.appendChild(btn);
      });
    }

    function ensureSettingsPanel() {
      let panel = document.getElementById('settingsPanel');
      if (panel) return panel;
      panel = document.createElement('div');
      panel.id = 'settingsPanel';
      panel.className = 'settings-panel-overlay';
      panel.setAttribute('aria-hidden', 'true');
      panel.innerHTML = ''
        + '<div class="settings-panel-backdrop" data-settings-close></div>'
        + '<div class="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settingsPanelTitle">'
        +   '<div class="settings-panel-header">'
        +     '<h3 id="settingsPanelTitle"><i class="fas fa-sliders-h"></i> Portfolio Settings</h3>'
        +     '<button type="button" class="settings-close" aria-label="Close settings" data-settings-close>'
        +       '<i class="fas fa-times"></i>'
        +     '</button>'
        +   '</div>'
        +   '<div class="settings-panel-body">'
        +     '<label class="settings-row"><span>Reduce animations</span><input type="checkbox" data-setting="reducedMotion" /></label>'
        +     '<label class="settings-row"><span>Large text</span><input type="checkbox" data-setting="largeText" /></label>'
        +     '<label class="settings-row"><span>High contrast</span><input type="checkbox" data-setting="highContrast" /></label>'
        +     '<label class="settings-row"><span>Hide custom cursor</span><input type="checkbox" data-setting="hideCursor" /></label>'
        +   '</div>'
        +   '<div class="settings-panel-footer">'
        +     '<button type="button" class="btn btn-sm btn-outline" data-settings-reset>Reset</button>'
        +     '<button type="button" class="btn btn-sm btn-primary" data-settings-close>Done</button>'
        +   '</div>'
        + '</div>';
      document.body.appendChild(panel);

      panel.querySelectorAll('[data-settings-close]').forEach(el => {
        el.addEventListener('click', closeSettingsPanel);
      });
      panel.querySelectorAll('input[data-setting]').forEach(input => {
        input.addEventListener('change', () => {
          const key = input.getAttribute('data-setting');
          upsertSetting(key, !!input.checked, 'Setting updated');
        });
      });
      panel.querySelector('[data-settings-reset]')?.addEventListener('click', () => {
        userSettings = {
          reducedMotion: false,
          largeText: false,
          highContrast: false,
          hideCursor: false,
        };
        applySettings(userSettings);
        saveSettings(userSettings);
        syncSettingsPanelUi();
        showToast('Settings reset', 'success', 1700);
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && panel.classList.contains('is-open')) closeSettingsPanel();
      });
      return panel;
    }

    function syncSettingsPanelUi() {
      if (!settingsPanel) return;
      settingsPanel.querySelectorAll('input[data-setting]').forEach(input => {
        const key = input.getAttribute('data-setting');
        input.checked = !!userSettings[key];
      });
    }

    function openSettingsPanel() {
      syncSettingsPanelUi();
      settingsPanel.classList.add('is-open');
      settingsPanel.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeSettingsPanel() {
      settingsPanel.classList.remove('is-open');
      settingsPanel.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    /* ============================================================
       7. SCROLL-TO-TOP BUTTON
       ============================================================ */
    const scrollTopBtn = document.getElementById('scrollTop') || document.querySelector('.scroll-top');
    if (scrollTopBtn) {
      window.addEventListener('scroll', () => {
        scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
      }, { passive: true });
      scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    /* ============================================================
       8. SCROLL PROGRESS BAR
       ============================================================ */
    const progressBar = document.querySelector('.scroll-progress');
    if (progressBar) {
      const updateProgress = () => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const p = h > 0 ? (window.scrollY / h) * 100 : 0;
        progressBar.style.width = p + '%';
      };
      window.addEventListener('scroll', updateProgress, { passive: true });
      updateProgress();
    }

    /* ============================================================
       9. CUSTOM CURSOR  (desktop only, hover-able pointer present)
       ============================================================ */
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (finePointer && window.innerWidth > 992 && !userSettings.hideCursor) {
      const dot  = document.createElement('div');
      const ring = document.createElement('div');
      dot.className  = 'cursor-dot';
      ring.className = 'cursor-ring';
      document.body.append(dot, ring);

      let mx = 0, my = 0, rx = 0, ry = 0;
      document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = `translate(${mx}px, ${my}px)`;
      });

      const loop = () => {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.transform = `translate(${rx}px, ${ry}px)`;
        requestAnimationFrame(loop);
      };
      loop();

      const hoverables = 'a, button, input, textarea, .card, .project-card, [data-tooltip], .hero-social-link';
      document.querySelectorAll(hoverables).forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('active'));
        el.addEventListener('mouseleave', () => ring.classList.remove('active'));
      });
    }

    /* ============================================================
       10. MAGNETIC BUTTONS
       ============================================================ */
    if (finePointer && window.innerWidth > 992) {
      document.querySelectorAll('.btn, .hero-social-link, .footer-social a').forEach(el => {
        el.addEventListener('mousemove', (e) => {
          const r = el.getBoundingClientRect();
          const x = e.clientX - r.left - r.width / 2;
          const y = e.clientY - r.top  - r.height / 2;
          el.style.transform = `translate(${x * 0.18}px, ${y * 0.25}px)`;
        });
        el.addEventListener('mouseleave', () => {
          el.style.transform = '';
        });
      });
    }

    /* ============================================================
       10b. ZOOM FOCUS INTERACTIONS (hover + click + parallax)
       ============================================================ */
    const reduceMotionActive = userSettings.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const zoomTargets = document.querySelectorAll(
      '.card:not(.project-card), .hero-img-container, .about-img-frame, .blog-card, .testimonial-card'
    );
    let activeZoomEl = null;
    const zoomOverlay = document.createElement('div');
    zoomOverlay.className = 'zoom-focus-overlay';
    document.body.appendChild(zoomOverlay);

    const updateOverlayFocusPoint = (el) => {
      const r = el.getBoundingClientRect();
      const fx = ((r.left + r.width / 2) / Math.max(window.innerWidth, 1)) * 100;
      const fy = ((r.top + r.height / 2) / Math.max(window.innerHeight, 1)) * 100;
      zoomOverlay.style.setProperty('--focus-x', fx.toFixed(2) + '%');
      zoomOverlay.style.setProperty('--focus-y', fy.toFixed(2) + '%');
    };

    const closeZoomFocus = () => {
      if (!activeZoomEl) return;
      activeZoomEl.classList.remove('is-zoomed');
      activeZoomEl.style.removeProperty('--zoom-pan-x');
      activeZoomEl.style.removeProperty('--zoom-pan-y');
      activeZoomEl = null;
      zoomOverlay.classList.remove('active');
      document.body.classList.remove('zoom-focus-active');
      document.body.style.overflow = '';
    };

    const openZoomFocus = (el) => {
      if (reduceMotionActive) return;
      if (activeZoomEl === el) { closeZoomFocus(); return; }
      closeZoomFocus();
      activeZoomEl = el;
      updateOverlayFocusPoint(el);
      el.classList.add('is-zoomed');
      zoomOverlay.classList.add('active');
      document.body.classList.add('zoom-focus-active');
      document.body.style.overflow = 'hidden';
    };

    zoomTargets.forEach(el => {
      el.classList.add('zoom-interactive');
      el.addEventListener('mousedown', () => el.classList.add('zoom-pressed'));
      el.addEventListener('mouseup', () => el.classList.remove('zoom-pressed'));
      el.addEventListener('mouseleave', () => el.classList.remove('zoom-pressed'));

      el.addEventListener('click', (e) => {
        if (e.target.closest('a, button, input, select, textarea, label, video')) return;
        openZoomFocus(el);
      });

      // Optional slight parallax for depth when focused
      el.addEventListener('mousemove', (e) => {
        if (activeZoomEl !== el || !finePointer || reduceMotionActive) return;
        const r = el.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
        el.style.setProperty('--zoom-pan-x', (nx * 8).toFixed(2) + 'px');
        el.style.setProperty('--zoom-pan-y', (ny * 8).toFixed(2) + 'px');
      });
    });

    zoomOverlay.addEventListener('click', closeZoomFocus);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeZoomFocus();
    });
    window.addEventListener('resize', () => {
      if (activeZoomEl) updateOverlayFocusPoint(activeZoomEl);
    });

    /* ============================================================
       11. AOS INIT
       ============================================================ */
    if (typeof AOS !== 'undefined') {
      const reduceMotion = userSettings.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 80,
        disable: reduceMotion,
      });
    }

    /* ============================================================
       11a. SCROLL CAMERA ZOOM (hero)
       ============================================================ */
    const zoomScene = document.querySelector('.scroll-zoom-scene');
    if (zoomScene && !reduceMotionActive) {
      const onZoomScroll = () => {
        const r = zoomScene.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, (window.innerHeight - r.top) / (window.innerHeight + r.height)));
        const scale = 1 + progress * 0.06;
        zoomScene.style.setProperty('--scroll-zoom', scale.toFixed(4));
      };
      window.addEventListener('scroll', onZoomScroll, { passive: true });
      onZoomScroll();
    }

    /* ============================================================
       11b. LAUNCHABLE PROJECT CARDS
            click card -> open web app / download file / launch desktop app
       ============================================================ */
    const resolveLaunchUrl = (url) => {
      if (!url || typeof url !== 'string') return url;
      const u = url.trim();
      try {
        return new URL(u, window.location.href).href;
      } catch {
        return u;
      }
    };

    const ensureProjectPanel = () => {
      let panel = document.getElementById('projectFocusPanel');
      if (panel) return panel;
      panel = document.createElement('div');
      panel.id = 'projectFocusPanel';
      panel.className = 'project-focus-overlay';
      panel.setAttribute('aria-hidden', 'true');
      panel.innerHTML = ''
        + '<div class="project-focus-backdrop" data-project-focus-close></div>'
        + '<aside class="project-focus-panel" role="dialog" aria-modal="true" aria-labelledby="projectFocusTitle">'
        +   '<button type="button" class="project-focus-close" data-project-focus-close aria-label="Close details">'
        +     '<i class="fas fa-times"></i>'
        +   '</button>'
        +   '<div class="project-focus-media"><img alt="" /></div>'
        +   '<div class="project-focus-content">'
        +     '<div class="project-focus-tags"></div>'
        +     '<h3 id="projectFocusTitle"></h3>'
        +     '<p class="project-focus-text"></p>'
        +     '<div class="project-focus-actions"></div>'
        +   '</div>'
        + '</aside>';
      document.body.appendChild(panel);
      panel.querySelectorAll('[data-project-focus-close]').forEach(el => {
        el.addEventListener('click', () => closeProjectPanel());
      });
      return panel;
    };

    const getPreferredLangText = (root, selector) => {
      const lang = document.body.getAttribute('data-language') || 'en';
      const inLang = root.querySelector(`${selector}[data-lang="${lang}"]`);
      if (inLang) return inLang.textContent.trim();
      const any = root.querySelector(selector);
      return any ? any.textContent.trim() : '';
    };

    const closeProjectPanel = () => {
      const panel = document.getElementById('projectFocusPanel');
      if (!panel) return;
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    const openProjectPanel = (card, onLaunch) => {
      const panel = ensureProjectPanel();
      const img = card.querySelector('.project-img img');
      const tags = [...card.querySelectorAll('.project-tags .badge')].map(t => t.textContent.trim()).filter(Boolean);
      const title = getPreferredLangText(card, '.project-info h3');
      const desc = getPreferredLangText(card, '.project-info p');
      const mediaImg = panel.querySelector('.project-focus-media img');
      const titleEl = panel.querySelector('#projectFocusTitle');
      const textEl = panel.querySelector('.project-focus-text');
      const tagsWrap = panel.querySelector('.project-focus-tags');
      const actions = panel.querySelector('.project-focus-actions');

      mediaImg.src = img?.getAttribute('src') || '';
      mediaImg.alt = img?.getAttribute('alt') || title || 'Project cover';
      titleEl.textContent = title || 'Project details';
      textEl.textContent = desc || '';
      tagsWrap.innerHTML = tags.map(t => `<span class="badge badge-primary">${t}</span>`).join('');
      actions.innerHTML = ''
        + '<button type="button" class="btn btn-primary btn-sm" data-panel-launch><i class="fas fa-rocket"></i> Launch</button>'
        + '<a href="projects.html" class="btn btn-outline btn-sm"><i class="fas fa-folder-open"></i> Projects</a>';
      actions.querySelector('[data-panel-launch]')?.addEventListener('click', (e) => {
        e.preventDefault();
        onLaunch();
      });

      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const IS_GITHUB_PAGES = /\.github\.io$/i.test(window.location.hostname);

    const launchDesktopApp = async (url, card) => {
      if (IS_GITHUB_PAGES) {
        showToast('This action works only on the PHP-hosted version of the site.', 'info', 3200);
        return;
      }
      card.classList.add('is-launching');
      const toast = (typeof window.showToast === 'function') ? window.showToast : null;
      toast && toast('Launching…', 'info', 1500);
      try {
        const res  = await fetch(resolveLaunchUrl(url), { method: 'GET', cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok) {
          toast && toast('✓ ' + (data.message || 'App launched'), 'success', 2500);
        } else {
          const msg = (data && data.message) ? data.message : 'Launch failed';
          toast && toast('✗ ' + msg, 'error', 3500);
          console.warn('Launch failed:', data);
        }
      } catch (err) {
        toast && toast('Launch error: ' + err.message, 'error', 3500);
      } finally {
        setTimeout(() => card.classList.remove('is-launching'), 600);
      }
    };

    document.querySelectorAll('.project-card-launchable').forEach(card => {
      const url  = card.getAttribute('data-launch-url');
      const mode = card.getAttribute('data-launch-mode') || 'web';
      if (!url) return;

      if (IS_GITHUB_PAGES && mode === 'app') {
        card.querySelectorAll('[data-launch-trigger]').forEach(btn => {
          btn.setAttribute('disabled', 'disabled');
          btn.setAttribute('title', 'Available on PHP-hosted version');
          btn.classList.add('is-disabled');
        });
      }

      const trigger = () => {
        if (mode === 'download') {
          const a = document.createElement('a');
          a.href = url;
          a.setAttribute('download', '');
          a.rel = 'noopener';
          document.body.appendChild(a);
          a.click();
          a.remove();
        } else if (mode === 'app') {
          launchDesktopApp(url, card);
        } else {
          const targetUrl = resolveLaunchUrl(url);
          const win = window.open(targetUrl, '_blank');
          if (win) {
            try { win.opener = null; } catch (_) { /* ignore */ }
          } else if (typeof window.showToast === 'function') {
            window.showToast(
              'Pop-up blocked — allow pop-ups for this site, or open: ' + targetUrl,
              'error',
              5200
            );
          }
        }
      };

      card.addEventListener('click', (e) => {
        if (e.target.closest('a, button, input, select, textarea, label')) return;
        openProjectPanel(card, trigger);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openProjectPanel(card, trigger);
        }
      });
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-haspopup', 'dialog');
      const labelMap = { download: 'Download details: ', app: 'Open app details: ' };
      card.setAttribute('aria-label', (labelMap[mode] || 'Open details: ') + url);

      // Wire inline `data-launch-trigger` buttons inside the card to
      // trigger the same mode (e.g., primary "Launch App" button).
      card.querySelectorAll('[data-launch-trigger]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          trigger();
        });
      });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeProjectPanel();
    });

    /* ============================================================
       11c. VIDEO MODAL
            Any element with [data-video-src="..."] opens a modal
            video player. Optional [data-video-title="..."] and
            [data-video-poster="..."] (thumbnail before playback).
       ============================================================ */
    const ensureVideoModal = () => {
      let modal = document.getElementById('videoModal');
      if (modal) return modal;
      modal = document.createElement('div');
      modal.id = 'videoModal';
      modal.className = 'video-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-hidden', 'true');
      modal.innerHTML = ''
        + '<div class="video-modal-backdrop" data-video-close></div>'
        + '<div class="video-modal-content" role="document">'
        +   '<div class="video-modal-header">'
        +     '<h3 class="video-modal-title" id="videoModalTitle">Demo</h3>'
        +     '<button type="button" class="video-modal-close" aria-label="Close" data-video-close>'
        +       '<i class="fas fa-times"></i>'
        +     '</button>'
        +   '</div>'
        +   '<div class="video-modal-body">'
        +     '<video controls preload="metadata" playsinline></video>'
        +   '</div>'
        + '</div>';
      document.body.appendChild(modal);

      const closeModal = () => {
        const v = modal.querySelector('video');
        if (v) {
          v.pause();
          v.removeAttribute('src');
          v.removeAttribute('poster');
          v.load();
        }
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      };
      modal.querySelectorAll('[data-video-close]').forEach(el =>
        el.addEventListener('click', closeModal)
      );
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
      });
      modal._close = closeModal;
      return modal;
    };

    const openVideo = (src, title, poster) => {
      const modal = ensureVideoModal();
      const v = modal.querySelector('video');
      const t = modal.querySelector('.video-modal-title');
      if (t) t.textContent = title || 'Demo';
      if (poster) v.setAttribute('poster', poster);
      else v.removeAttribute('poster');
      v.onerror = () => {
        showToast('Video could not be loaded. Check the file exists (see videos/README.txt).', 'error', 4200);
      };
      v.src = src;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const playPromise = v.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => { /* autoplay blocked; user clicks play */ });
      }
    };

    document.querySelectorAll('[data-video-src]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const src = el.getAttribute('data-video-src');
        const title = el.getAttribute('data-video-title') || el.getAttribute('aria-label') || 'Demo';
        const poster = el.getAttribute('data-video-poster');
        if (src) openVideo(src, title, poster);
      });
    });

    /* ============================================================
       12. SMOOTH-SCROLL FOR ANCHORS
       ============================================================ */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href');
        if (!id || id === '#' || id.length < 2) return;
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          const navH = parseInt(getComputedStyle(htmlEl).getPropertyValue('--navbar-height')) || 70;
          const top = target.getBoundingClientRect().top + window.scrollY - navH - 10;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });

    /* ============================================================
       13. PROGRESS BAR REVEAL
       ============================================================ */
    const bars = document.querySelectorAll('.progress-fill');
    if (bars.length) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const w = e.target.getAttribute('data-width') || '0%';
            setTimeout(() => e.target.style.width = w, 100);
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.3 });
      bars.forEach(b => io.observe(b));
    }

    /* ============================================================
       14. COUNTER ANIMATION
       ============================================================ */
    const counters = document.querySelectorAll('.counter');
    if (counters.length) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { animateCounter(e.target); io.unobserve(e.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(c => io.observe(c));
    }

    function animateCounter(el) {
      const target = parseInt(el.getAttribute('data-target')) || 0;
      const duration = 1800;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.floor(eased * target);
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = target;
      };
      requestAnimationFrame(step);
    }

    /* ============================================================
       15. MODAL SYSTEM
       ============================================================ */
    window.openModal  = id => {
      const m = document.getElementById(id);
      if (m) { m.classList.add('active'); document.body.style.overflow = 'hidden'; }
    };
    window.closeModal = id => {
      const m = document.getElementById(id);
      if (m) { m.classList.remove('active'); document.body.style.overflow = ''; }
    };

    document.querySelectorAll('.modal-overlay').forEach(ov => {
      ov.addEventListener('click', (e) => {
        if (e.target === ov) { ov.classList.remove('active'); document.body.style.overflow = ''; }
      });
    });
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        const ov = btn.closest('.modal-overlay');
        if (ov) { ov.classList.remove('active'); document.body.style.overflow = ''; }
      });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => {
          m.classList.remove('active');
        });
        document.body.style.overflow = '';
      }
    });

    /* ============================================================
       16. TOAST
       ============================================================ */
    window.showToast = (message, type = 'info', duration = 3000) => {
      document.querySelectorAll('.toast').forEach(t => t.remove());
      const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>`;
      document.body.appendChild(toast);
      requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
      }, duration);
    };

    /* ============================================================
       17. TYPING ANIMATION
       ============================================================ */
    const typingEl = document.querySelector('.typing-text');
    if (typingEl) {
      let words = [];
      try { words = JSON.parse(typingEl.getAttribute('data-words') || '[]'); } catch (e) {}
      if (words.length) {
        let wi = 0, ci = 0, del = false;
        const tick = () => {
          const word = words[wi];
          typingEl.textContent = word.substring(0, del ? ci - 1 : ci + 1);
          let speed = del ? 40 : 90;
          if (!del) ci++;
          else ci--;
          if (!del && ci === word.length) { del = true; speed = 1600; }
          if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; speed = 350; }
          setTimeout(tick, speed);
        };
        setTimeout(tick, 700);
      }
    }

    /* ============================================================
       18. FILTER BUTTONS
       ============================================================ */
    document.querySelectorAll('[data-filter-group]').forEach(group => {
      const btns  = group.querySelectorAll('.filter-btn');
      const itemsContainer = document.querySelector(group.getAttribute('data-filter-group'));
      if (!itemsContainer) return;
      const items = itemsContainer.querySelectorAll('[data-category]');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');
          const f = btn.getAttribute('data-filter');
          items.forEach(item => {
            const show = f === 'all' || item.getAttribute('data-category') === f;
            item.style.display = show ? '' : 'none';
            if (show) item.style.animation = 'fadeInUp 0.5s ease forwards';
          });
        });
      });
    });
    // legacy simple filter
    const legacyBtns = document.querySelectorAll('.filter-btn');
    if (legacyBtns.length && !document.querySelector('[data-filter-group]')) {
      legacyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          legacyBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');
          const f = btn.getAttribute('data-filter');
          document.querySelectorAll('[data-category]').forEach(item => {
            const show = f === 'all' || item.getAttribute('data-category') === f;
            item.style.display = show ? '' : 'none';
          });
        });
      });
    }

    /* ============================================================
       19. SEARCH INPUT
       ============================================================ */
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        document.querySelectorAll('[data-search]').forEach(it => {
          it.style.display = it.getAttribute('data-search').toLowerCase().includes(q) ? '' : 'none';
        });
      });
    }

    /* ============================================================
       20. LAZY LOAD IMAGES
       ============================================================ */
    const lazyImgs = document.querySelectorAll('img[data-src]');
    if (lazyImgs.length) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const img = e.target;
            img.src = img.getAttribute('data-src');
            img.removeAttribute('data-src');
            img.classList.add('loaded');
            io.unobserve(img);
          }
        });
      });
      lazyImgs.forEach(img => io.observe(img));
    }

    /* ============================================================
       21. FOOTER YEAR
       ============================================================ */
    document.querySelectorAll('.current-year').forEach(el => el.textContent = new Date().getFullYear());

    /* ============================================================
       22. TOOLTIPS (data-tooltip)
       ============================================================ */
    document.querySelectorAll('[data-tooltip]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        const tip = document.createElement('div');
        tip.className = 'tooltip-popup';
        tip.textContent = el.getAttribute('data-tooltip');
        document.body.appendChild(tip);
        const r = el.getBoundingClientRect();
        tip.style.left = r.left + r.width / 2 - tip.offsetWidth / 2 + 'px';
        tip.style.top  = r.top  - tip.offsetHeight - 10 + 'px';
        el._tip = tip;
      });
      el.addEventListener('mouseleave', () => {
        if (el._tip) { el._tip.remove(); el._tip = null; }
      });
    });

    /* ============================================================
       23. TILT CARDS (subtle 3D tilt)
       ============================================================ */
    if (finePointer && window.innerWidth > 992) {
      document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const r = card.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width  - 0.5) * 2;
          const y = ((e.clientY - r.top)  / r.height - 0.5) * 2;
          card.style.transform = `perspective(1000px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateZ(6px)`;
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
        });
      });
    }

    /* ============================================================
       24. COPY-TO-CLIPBOARD   (data-copy="text")
       ============================================================ */
    document.querySelectorAll('[data-copy]').forEach(el => {
      el.addEventListener('click', async (e) => {
        e.preventDefault();
        const text = el.getAttribute('data-copy');
        try {
          await navigator.clipboard.writeText(text);
          showToast('Copied to clipboard!', 'success', 1800);
        } catch {
          showToast('Copy failed', 'error', 1800);
        }
      });
    });

    /* ============================================================
       25. SPLIT TEXT REVEAL  (.reveal-text)
       ============================================================ */
    document.querySelectorAll('.reveal-text').forEach(el => {
      const text = el.textContent;
      el.textContent = '';
      [...text].forEach((ch, i) => {
        const span = document.createElement('span');
        span.className = 'reveal-char';
        span.style.animationDelay = (i * 0.03) + 's';
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        el.appendChild(span);
      });
    });

    /* ============================================================
       26. COMMAND PALETTE  (Ctrl / Cmd + K)
       ============================================================ */
    const palette      = document.getElementById('cmdPalette');
    const paletteInput = document.getElementById('cmdPaletteInput');
    const paletteList  = document.getElementById('cmdPaletteList');

    const openPalette  = () => {
      if (!palette) return;
      palette.classList.add('active');
      document.body.style.overflow = 'hidden';
      setTimeout(() => paletteInput && paletteInput.focus(), 60);
      renderPalette('');
    };
    const closePalette = () => {
      if (!palette) return;
      palette.classList.remove('active');
      document.body.style.overflow = '';
      if (paletteInput) paletteInput.value = '';
    };
    window.openPalette  = openPalette;
    window.closePalette = closePalette;

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        palette && palette.classList.contains('active') ? closePalette() : openPalette();
      }
      if (e.key === 'Escape' && palette && palette.classList.contains('active')) {
        closePalette();
      }
    });

    if (palette) {
      palette.addEventListener('click', e => { if (e.target === palette) closePalette(); });
    }

    function renderPalette(filter) {
      if (!paletteList) return;
      const q = (filter || '').toLowerCase().trim();
      const items = (window.CMD_ITEMS || []).filter(i =>
        !q || i.label.toLowerCase().includes(q) || (i.keywords || '').toLowerCase().includes(q)
      );
      paletteList.innerHTML = items.length
        ? items.map((i, idx) => `
          <a href="${i.href}" class="cmd-item ${idx === 0 ? 'active' : ''}" data-idx="${idx}"${i.data?.langSet ? ` data-lang-set="${i.data.langSet}"` : ''}>
            <i class="${i.icon || 'fas fa-link'}"></i>
            <span class="cmd-label">${i.label}</span>
            ${i.hint ? `<span class="cmd-hint">${i.hint}</span>` : ''}
          </a>`).join('')
        : `<div class="cmd-empty"><i class="fas fa-search"></i> No results</div>`;
    }

    if (paletteInput) {
      paletteInput.addEventListener('input', e => renderPalette(e.target.value));
      paletteInput.addEventListener('keydown', e => {
        const items = paletteList.querySelectorAll('.cmd-item');
        if (!items.length) return;
        let idx = [...items].findIndex(x => x.classList.contains('active'));
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          items[idx]?.classList.remove('active');
          items[(idx + 1) % items.length].classList.add('active');
          items[(idx + 1) % items.length].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          items[idx]?.classList.remove('active');
          items[(idx - 1 + items.length) % items.length].classList.add('active');
          items[(idx - 1 + items.length) % items.length].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
          e.preventDefault();
          items[Math.max(idx, 0)]?.click();
        }
      });
    }

    /* Default command items (pages can override window.CMD_ITEMS before load) */
    window.CMD_ITEMS = window.CMD_ITEMS || [
      { label: 'Home',         href: 'index.html',        icon: 'fas fa-home',         hint: 'G H',   keywords: 'main start' },
      { label: 'About',        href: 'about.html',        icon: 'fas fa-user',         hint: 'G A',   keywords: 'bio me' },
      { label: 'Skills',       href: 'skills.html',       icon: 'fas fa-code',         hint: 'G S',   keywords: 'tech stack' },
      { label: 'Projects',     href: 'projects.html',     icon: 'fas fa-folder-open',  hint: 'G P',   keywords: 'work portfolio' },
      { label: 'Education',    href: 'education.html',    icon: 'fas fa-graduation-cap', keywords: 'school university' },
      { label: 'Experience',   href: 'experience.html',   icon: 'fas fa-briefcase',    keywords: 'job work' },
      { label: 'Gallery',      href: 'gallery.html',      icon: 'fas fa-image',        keywords: 'photos images' },
      { label: 'Blog',         href: 'blog.html',         icon: 'fas fa-newspaper',    keywords: 'articles posts' },
      { label: 'Testimonials', href: 'testimonials.html', icon: 'fas fa-comments',     keywords: 'reviews feedback' },
      { label: 'Contact',      href: 'contact.html',      icon: 'fas fa-envelope',     hint: 'G C',   keywords: 'reach email message' },
      { label: 'Achievements', href: 'achievements.html', icon: 'fas fa-trophy',       keywords: 'awards wins' },
      { label: 'Resume / CV',  href: 'resume.html',       icon: 'fas fa-file-alt',     hint: 'G R',   keywords: 'cv curriculum' },
      { label: 'Admin dashboard',   href: 'admin/index.php', icon: 'fas fa-lock',     keywords: 'messages subscribers' },
      { label: 'Toggle theme',      href: '#',               icon: 'fas fa-adjust',   keywords: 'dark light mode' },
      { label: 'Language: English', href: '#',               icon: 'fas fa-language', keywords: 'english en langue idioma', data: { langSet: 'en' } },
      { label: 'Langue: Français',  href: '#',               icon: 'fas fa-language', keywords: 'french français fr langue', data: { langSet: 'fr' } },
      { label: 'Idioma: Español',   href: '#',               icon: 'fas fa-language', keywords: 'spanish español es idioma', data: { langSet: 'es' } },
    ];

    if (paletteList) {
      paletteList.addEventListener('click', (e) => {
        const a = e.target.closest('.cmd-item');
        if (!a) return;
        const label = a.querySelector('.cmd-label')?.textContent.toLowerCase() || '';
        const langSet = a.getAttribute('data-lang-set');
        if (label.startsWith('toggle theme')) {
          e.preventDefault(); themeToggles[0]?.click(); closePalette();
        } else if (langSet) {
          e.preventDefault(); window.setLanguage?.(langSet); closePalette();
        } else {
          closePalette();
        }
      });
    }

    /* ============================================================
       27. "G-KEY" QUICK NAV  (g then letter)
       ============================================================ */
    let gPending = false, gTimer = null;
    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea, [contenteditable="true"]')) return;
      if (e.key.toLowerCase() === 'g' && !gPending) {
        gPending = true;
        gTimer = setTimeout(() => { gPending = false; }, 900);
        return;
      }
      if (gPending) {
        gPending = false;
        clearTimeout(gTimer);
        const map = { h: 'index.html', a: 'about.html', s: 'skills.html', p: 'projects.html', c: 'contact.html', r: 'resume.html', b: 'blog.html' };
        const target = map[e.key.toLowerCase()];
        if (target) window.location.href = target;
      }
    });

    /* ============================================================
       28. KONAMI CODE EASTER EGG 🎉
       ============================================================ */
    const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let kIdx = 0;
    document.addEventListener('keydown', (e) => {
      const k = e.key;
      if (k.toLowerCase() === konami[kIdx].toLowerCase() || k === konami[kIdx]) {
        kIdx++;
        if (kIdx === konami.length) { kIdx = 0; launchConfetti(); showToast('🎉 Konami unlocked!', 'success', 2500); }
      } else {
        kIdx = 0;
      }
    });

    function launchConfetti() {
      const colors = ['#6c63ff', '#ff6584', '#22c55e', '#eab308', '#8b85ff'];
      for (let i = 0; i < 80; i++) {
        const c = document.createElement('div');
        c.className = 'confetti-piece';
        c.style.left = Math.random() * 100 + 'vw';
        c.style.background = colors[i % colors.length];
        c.style.animationDelay = (Math.random() * 0.4) + 's';
        c.style.animationDuration = (2 + Math.random() * 2) + 's';
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 4500);
      }
    }

    /* ============================================================
       29. SECTION-IN-VIEW HIGHLIGHT (on-page nav links)
       ============================================================ */
    const sections = document.querySelectorAll('section[id]');
    if (sections.length && document.querySelectorAll('.navbar-link[href^="#"]').length) {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(en => {
          const id = en.target.id;
          const link = document.querySelector(`.navbar-link[href="#${id}"]`);
          if (!link) return;
          if (en.isIntersecting) {
            document.querySelectorAll('.navbar-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
          }
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      sections.forEach(s => obs.observe(s));
    }

    /* ============================================================
       30. FORM ENHANCE (floating labels)
       ============================================================ */
    document.querySelectorAll('.form-control').forEach(f => {
      const sync = () => f.classList.toggle('has-value', !!f.value.trim());
      f.addEventListener('input', sync);
      f.addEventListener('blur', sync);
      sync();
    });

    /* ============================================================
       31. BACKEND API  (PHP)  — shared helpers + auto-wiring
       ============================================================ */
    // Resolve relative api/ regardless of current page depth
    const API_BASE = (() => {
      const p = window.location.pathname.replace(/[^/]+$/, '');
      return p + 'api/';
    })();

    window.PortfolioAPI = {
      base: API_BASE,

      async post(endpoint, payload) {
        const res = await fetch(API_BASE + endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload || {}),
        });
        const ct = res.headers.get('content-type') || '';
        const data = ct.includes('json') ? await res.json() : { ok: res.ok, message: await res.text() };
        if (!res.ok) throw new Error(data.message || 'Request failed');
        return data;
      },

      async get(endpoint, params) {
        const q = params ? '?' + new URLSearchParams(params).toString() : '';
        const res = await fetch(API_BASE + endpoint + q, { method: 'GET' });
        const ct = res.headers.get('content-type') || '';
        const data = ct.includes('json') ? await res.json() : { ok: res.ok, message: await res.text() };
        if (!res.ok) throw new Error(data.message || 'Request failed');
        return data;
      },
    };

    if (IS_GITHUB_PAGES) {
      // GitHub Pages is static hosting only; PHP endpoints are unavailable.
      document.querySelectorAll('a[href$="admin/index.php"]').forEach(link => {
        link.setAttribute('href', '#');
        link.setAttribute('title', 'Admin is available only on PHP hosting');
      });
    }

    // ---- Auto-wire newsletter forms (<form class="newsletter-form">)
    document.querySelectorAll('.newsletter-form').forEach(form => {
      form.addEventListener('submit', async (e) => {
        if (IS_GITHUB_PAGES) {
          e.preventDefault();
          showToast('Newsletter is disabled on GitHub Pages (static hosting).', 'info', 3000);
          return;
        }
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        const btn   = form.querySelector('button[type="submit"]');
        const email = input?.value.trim();
        if (!email) return showToast('Please enter your email', 'error');
        const original = btn?.innerHTML;
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; }
        try {
          const res = await PortfolioAPI.post('newsletter.php', { email });
          showToast(res.message || 'Subscribed!', 'success');
          input.value = '';
          // Refresh live count if present
          document.querySelectorAll('[data-sub-count]').forEach(el => el.textContent = res.data?.count ?? '');
        } catch (err) {
          showToast(err.message || 'Subscription failed', 'error');
        } finally {
          if (btn) { btn.disabled = false; btn.innerHTML = original; }
        }
      });
    });

    // ---- Auto-wire contact form (<form id="contactForm">)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', async (e) => {
        if (IS_GITHUB_PAGES) {
          e.preventDefault();
          showToast('Contact form works on the PHP-hosted version only.', 'info', 3000);
          return;
        }
        e.preventDefault();
        const fd = new FormData(contactForm);
        const payload = {
          name:    (fd.get('name')    || '').toString().trim(),
          email:   (fd.get('email')   || '').toString().trim(),
          subject: (fd.get('subject') || '').toString().trim(),
          message: (fd.get('message') || '').toString().trim(),
          website: (fd.get('website') || '').toString(),   // honeypot
        };
        if (!payload.name || !payload.email || !payload.subject || !payload.message) {
          return showToast('Please fill in all fields', 'error');
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
          return showToast('Please enter a valid email', 'error');
        }
        const btn = contactForm.querySelector('button[type="submit"]');
        const original = btn?.innerHTML;
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...'; }
        try {
          const res = await PortfolioAPI.post('contact.php', payload);
          showToast(res.message || 'Message sent!', 'success', 4000);
          contactForm.reset();
        } catch (err) {
          showToast(err.message || 'Could not send message', 'error');
        } finally {
          if (btn) { btn.disabled = false; btn.innerHTML = original; }
        }
      });
    }

    // ---- Visitor counter: ping + display ([data-visitors="total|today"])
    const visitorTargets = document.querySelectorAll('[data-visitors]');
    if (visitorTargets.length) {
      if (IS_GITHUB_PAGES) {
        visitorTargets.forEach(el => { el.textContent = '0'; });
      } else {
      // POST once per session, then render
      const sessionKey = 'portfolio-visit-pinged';
      const pinged = sessionStorage.getItem(sessionKey);
      const req = pinged
        ? PortfolioAPI.get('visitors.php')
        : PortfolioAPI.post('visitors.php', {}).then(r => (sessionStorage.setItem(sessionKey, '1'), r));
      req.then(res => {
        const d = res.data || {};
        visitorTargets.forEach(el => {
          const key = el.getAttribute('data-visitors');
          if (key && d[key] != null) el.textContent = d[key];
        });
      }).catch(() => { /* silent */ });
      }
    }

    // ---- Fetch live sub-count on load
    document.querySelectorAll('[data-sub-count]').forEach(el => {
      if (IS_GITHUB_PAGES) {
        el.textContent = '0';
      } else {
        PortfolioAPI.get('newsletter.php').then(r => {
          el.textContent = r.data?.count ?? '0';
        }).catch(() => { el.textContent = '0'; });
      }
    });

    console.log('%c🚀 Portfolio loaded — Youssef El Amri', 'color:#6c63ff;font-weight:700;font-size:14px;');
    console.log('%c💡 Tip: press Ctrl+K for the command palette', 'color:#ff6584;');
  });
})();
