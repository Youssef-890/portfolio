/* ============================================================
   HOME PAGE JS — Particles, Testimonials Swiper, Hero Parallax
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     1. CANVAS PARTICLES BACKGROUND
     ============================================================ */
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [];
    let rafId = null;
    const lowEnd = (navigator.hardwareConcurrency || 4) <= 4;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width  = rect.width  * DPR;
      canvas.height = rect.height * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    class Particle {
      constructor() { this.reset(); }
      reset() {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.color = Math.random() > 0.5 ? '108, 99, 255' : '255, 101, 132';
      }
      update() {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0) this.x = w;
        if (this.x > w) this.x = 0;
        if (this.y < 0) this.y = h;
        if (this.y > h) this.y = 0;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        ctx.fill();
      }
    }

    function initParticles() {
      resize();
      particles = [];
      const w = canvas.clientWidth, h = canvas.clientHeight;
      const density = lowEnd ? 24000 : 12000;
      const max = lowEnd ? 60 : 120;
      const count = Math.min(Math.floor((w * h) / density), max);
      for (let i = 0; i < count; i++) particles.push(new Particle());
    }

    function drawConnections() {
      const maxDist = lowEnd ? 90 : 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(108, 99, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      drawConnections();
      rafId = requestAnimationFrame(animate);
    }

    function start() { if (!rafId) rafId = requestAnimationFrame(animate); }
    function stop()  { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }

    initParticles();
    start();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { stop(); initParticles(); start(); }, 150);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else start();
    });
  }

  /* ============================================================
     2. TESTIMONIALS SWIPER
     ============================================================ */
  const testimonialSwiper = document.querySelector('.testimonial-swiper');
  if (testimonialSwiper && typeof Swiper !== 'undefined') {
    new Swiper('.testimonial-swiper', {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      grabCursor: true,
      autoplay: {
        delay: 4500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      breakpoints: {
        768:  { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      },
    });
  }

  /* ============================================================
     3. HERO PARALLAX ON MOUSE MOVE
     ============================================================ */
  const heroSection = document.querySelector('.hero');
  const heroImage   = document.querySelector('.hero-image');
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  if (heroSection && heroImage && finePointer && window.innerWidth > 768) {
    let rafPending = false;
    let targetX = 0, targetY = 0;
    heroSection.addEventListener('mousemove', (e) => {
      const r = heroSection.getBoundingClientRect();
      targetX = ((e.clientX - r.left) / r.width  - 0.5) * 20;
      targetY = ((e.clientY - r.top)  / r.height - 0.5) * 15;
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
          heroImage.style.transform = `translate(${targetX}px, ${targetY}px)`;
          rafPending = false;
        });
      }
    });
    heroSection.addEventListener('mouseleave', () => {
      heroImage.style.transform = '';
    });
  }

  console.log('🏠 Home JS loaded');
});
