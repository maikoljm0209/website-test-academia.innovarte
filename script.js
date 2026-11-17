/* ======================================================
   ACADEMIA INNOVARTE — INTERACCIONES
   JavaScript puro, sin librerías externas
   ====================================================== */

'use strict';

const header = document.getElementById('siteHeader');
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
const navLinks = [...document.querySelectorAll('.nav-link')];
const backToTop = document.getElementById('backToTop');
const scrollProgress = document.getElementById('scrollProgress');
const sections = [...document.querySelectorAll('main section[id]')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ----------------------------
   HEADER + PROGRESO DE SCROLL
----------------------------- */
function handleScrollUI() {
  const scrollY = window.scrollY;

  header.classList.toggle('scrolled', scrollY > 28);
  backToTop.classList.toggle('visible', scrollY > 520);

  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = documentHeight > 0 ? (scrollY / documentHeight) * 100 : 0;
  scrollProgress.style.width = `${Math.min(progress, 100)}%`;
}

window.addEventListener('scroll', handleScrollUI, { passive: true });
handleScrollUI();

/* ----------------------------
   MENÚ MÓVIL / HAMBURGER
----------------------------- */
function setMenu(open) {
  menuToggle.classList.toggle('open', open);
  mainNav.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
}

menuToggle.addEventListener('click', () => {
  setMenu(!mainNav.classList.contains('open'));
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

mainNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 900) setMenu(false);
});

/* ----------------------------
   NAVEGACIÓN ACTIVA POR SECCIÓN
----------------------------- */
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const id = entry.target.id;
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    });
  },
  {
    rootMargin: '-36% 0px -56% 0px',
    threshold: 0
  }
);

sections.forEach((section) => sectionObserver.observe(section));

/* ----------------------------
   REVEAL AL HACER SCROLL
----------------------------- */
const revealItems = document.querySelectorAll('.reveal');

if (reduceMotion) {
  revealItems.forEach((item) => item.classList.add('visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: '0px 0px -40px 0px' }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

/* ----------------------------
   CONTADORES ANIMADOS
----------------------------- */
const statsSection = document.querySelector('.stats-section');
const counters = document.querySelectorAll('[data-count]');
let countersStarted = false;

function animateCounter(element) {
  const target = Number(element.dataset.count);
  const duration = 1200;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    element.textContent = value;

    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

if (statsSection) {
  const statsObserver = new IntersectionObserver(
    (entries, observer) => {
      if (entries.some((entry) => entry.isIntersecting) && !countersStarted) {
        countersStarted = true;
        counters.forEach((counter) => {
          if (reduceMotion) {
            counter.textContent = counter.dataset.count;
          } else {
            animateCounter(counter);
          }
        });
        observer.disconnect();
      }
    },
    { threshold: 0.35 }
  );

  statsObserver.observe(statsSection);
}

/* ----------------------------
   CARRUSEL DE TESTIMONIOS
----------------------------- */
const testimonialCards = [...document.querySelectorAll('.testimonial-card')];
const sliderDots = document.getElementById('sliderDots');
const prevTestimonial = document.getElementById('prevTestimonial');
const nextTestimonial = document.getElementById('nextTestimonial');
let activeTestimonial = 0;
let sliderTimer;

function renderDots() {
  testimonialCards.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = `slider-dot${index === 0 ? ' active' : ''}`;
    dot.setAttribute('aria-label', `Ver testimonio ${index + 1}`);
    dot.addEventListener('click', () => {
      showTestimonial(index);
      restartSlider();
    });
    sliderDots.appendChild(dot);
  });
}

function showTestimonial(index) {
  const total = testimonialCards.length;
  activeTestimonial = (index + total) % total;

  testimonialCards.forEach((card, cardIndex) => {
    card.classList.toggle('active', cardIndex === activeTestimonial);
  });

  [...sliderDots.children].forEach((dot, dotIndex) => {
    dot.classList.toggle('active', dotIndex === activeTestimonial);
  });
}

function startSlider() {
  if (reduceMotion || testimonialCards.length < 2) return;
  sliderTimer = window.setInterval(() => {
    showTestimonial(activeTestimonial + 1);
  }, 6500);
}

function restartSlider() {
  window.clearInterval(sliderTimer);
  startSlider();
}

renderDots();
startSlider();

prevTestimonial.addEventListener('click', () => {
  showTestimonial(activeTestimonial - 1);
  restartSlider();
});

nextTestimonial.addEventListener('click', () => {
  showTestimonial(activeTestimonial + 1);
  restartSlider();
});

/* ----------------------------
   BOTÓN VOLVER ARRIBA
----------------------------- */
backToTop.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: reduceMotion ? 'auto' : 'smooth'
  });
});

/* ----------------------------
   ENLACES SOCIALES PLACEHOLDER
   Evita salto brusco mientras se sustituyen por URLs reales.
----------------------------- */
document.querySelectorAll('.social-link[href="#"]').forEach((link) => {
  link.addEventListener('click', (event) => event.preventDefault());
});

/* ----------------------------
   AÑO AUTOMÁTICO DEL FOOTER
----------------------------- */
document.getElementById('currentYear').textContent = new Date().getFullYear();
