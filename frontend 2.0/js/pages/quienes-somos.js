// ============================================
// QUIÉNES SOMOS - PÁGINA INSTITUCIONAL
// ============================================

import { initPage } from '../auth.js';

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar página
  initPage();
  
  // Inicializar animaciones opcionales
  initAnimations();
});

// ============================================
// ANIMACIONES
// ============================================

function initAnimations() {
  // Observer para animar elementos al hacer scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in');
      }
    });
  }, observerOptions);
  
  // Observar cards y secciones
  const elementsToAnimate = document.querySelectorAll('.card, section');
  elementsToAnimate.forEach(element => {
    observer.observe(element);
  });
  
  // Agregar estilos de animación si no existen
  addAnimationStyles();
}

// ============================================
// ESTILOS DE ANIMACIÓN
// ============================================

function addAnimationStyles() {
  if (document.getElementById('about-animations')) return;
  
  const style = document.createElement('style');
  style.id = 'about-animations';
  style.textContent = `
    .animate-fade-in {
      animation: fadeInUp 0.6s ease-out forwards;
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Efecto hover en las cards */
    .card:hover {
      transform: translateY(-5px);
      transition: transform 0.3s ease;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
    }
    
    .card {
      transition: all 0.3s ease;
    }
  `;
  
  document.head.appendChild(style);
}

// ============================================
// SMOOTH SCROLL
// ============================================

// Smooth scroll para enlaces internos (si los hay)
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href !== '#' && href !== '') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
});