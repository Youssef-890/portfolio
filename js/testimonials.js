ngl/* ============================================================
   TESTIMONIALS PAGE JS - Youssef El Amri Portfolio
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  
  /* ── Initialize Swiper for Testimonials ── */
  if (typeof Swiper !== 'undefined') {
    const testimonialSwiper = new Swiper('.testimonial-swiper', {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true,
      },
      breakpoints: {
        640: {
          slidesPerView: 1,
        },
        768: {
          slidesPerView: 2,
        },
        1024: {
          slidesPerView: 3,
        }
      },
      effect: 'fade',
      fadeEffect: {
        crossFade: true,
      }
    });
  }
  
  console.log('💬 Testimonials page loaded');
});
