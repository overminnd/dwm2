/**
 * ============================================================================
 * MARAZUL - Página Quiénes Somos
 * ============================================================================
 * 
 * Archivo: pages/quienes-somos.js
 * Descripción: Lógica de la página informativa sobre la empresa
 * Versión: 1.0
 */

import {
  loadComponent,
  initHeader
} from '../auth.js';
import { log } from '../utils.js';

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

/**
 * Inicializa la página de quiénes somos
 */
async function init() {
  try {
    log('info', 'Inicializando página quiénes somos...');
    
    // Cargar componentes
    await loadComponents();
    
    // Inicializar header
    initHeader();
    
    // Configurar eventos (si hay alguno)
    setupEvents();
    
    // Inicializar animaciones o efectos visuales (opcional)
    initAnimations();
    
    log('info', 'Página quiénes somos inicializada');
  } catch (error) {
    log('error', 'Error inicializando quiénes somos:', error);
  }
}

/**
 * Carga componentes HTML necesarios
 */
async function loadComponents() {
  try {
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
      await loadComponent('header-container', '../components/header.html');
    }
  } catch (error) {
    log('error', 'Error cargando componentes:', error);
  }
}

// ============================================================================
// ANIMACIONES Y EFECTOS VISUALES
// ============================================================================

/**
 * Inicializa animaciones de entrada (opcional)
 */
function initAnimations() {
  // Fade in para secciones al hacer scroll
  const sections = document.querySelectorAll('.fade-in-section');
  
  if (sections.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1
    });
    
    sections.forEach(section => {
      observer.observe(section);
    });
  }
}

/**
 * Scroll suave a secciones
 * @param {string} sectionId - ID de la sección
 */
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ============================================================================
// EVENTOS
// ============================================================================

/**
 * Configura todos los eventos de la página
 */
function setupEvents() {
  // Enlaces de navegación interna (si existen)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href.length > 1) {
        e.preventDefault();
        const sectionId = href.substring(1);
        scrollToSection(sectionId);
      }
    });
  });
  
  // Botón de contacto (si existe)
  const btnContact = document.getElementById('btn-contact');
  if (btnContact) {
    btnContact.addEventListener('click', function() {
      window.location.href = '/MARAZUL/MARAZUL/frontend02/components/contacto.html';
    });
  }
  
  // Acordeones o tabs (si existen)
  setupAccordions();
}

/**
 * Configura acordeones si existen en la página
 */
function setupAccordions() {
  const accordions = document.querySelectorAll('.accordion-button');
  
  accordions.forEach(button => {
    button.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      log('debug', `Acordeón ${isExpanded ? 'cerrado' : 'abierto'}`);
    });
  });
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Contador animado para números (opcional)
 * @param {string} elementId - ID del elemento
 * @param {number} targetValue - Valor objetivo
 * @param {number} duration - Duración en ms
 */
function animateCounter(elementId, targetValue, duration = 2000) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const startValue = 0;
  const increment = targetValue / (duration / 16); // 60fps
  let currentValue = startValue;
  
  const timer = setInterval(() => {
    currentValue += increment;
    
    if (currentValue >= targetValue) {
      element.textContent = targetValue.toFixed(0);
      clearInterval(timer);
    } else {
      element.textContent = currentValue.toFixed(0);
    }
  }, 16);
}

/**
 * Inicializa contadores si existen
 */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  
  if (counters.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          const target = parseInt(entry.target.dataset.target);
          animateCounter(entry.target.id, target);
          entry.target.classList.add('counted');
        }
      });
    }, {
      threshold: 0.5
    });
    
    counters.forEach(counter => {
      observer.observe(counter);
    });
  }
}

// ============================================================================
// INICIAR AL CARGAR LA PÁGINA
// ============================================================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Exports
export {
  init,
  scrollToSection,
  animateCounter
};