/* ============================================================
   CONTACT PAGE JS - Youssef El Amri Portfolio
   -----------------------------------------------------------------
   Note: the #contactForm submission is handled globally in
   js/global.js (which POSTs to /api/contact.php). This file only
   adds page-specific niceties (map click + scroll animations).
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Map Placeholder Click ── */
  const mapPlaceholder = document.querySelector('.map-placeholder');
  if (mapPlaceholder) {
    mapPlaceholder.addEventListener('click', () => {
      window.open('https://www.google.com/maps/place/Tetouan,+Morocco', '_blank', 'noopener');
    });
  }

  /* ── Animate Contact Methods on Scroll ── */
  const contactMethods = document.querySelectorAll('.contact-method');
  if (contactMethods.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateX(0)';
          }, index * 150);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    contactMethods.forEach(method => {
      method.style.opacity = '0';
      method.style.transform = method.closest('.contact-info') ? 'translateX(-30px)' : 'translateX(30px)';
      method.style.transition = 'all 0.5s ease';
      observer.observe(method);
    });
  }

  console.log('📧 Contact page loaded');
});
