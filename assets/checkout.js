/**
 * =========================================================================
 * SAULIBETH RIVAS — MÓDULO DE INTEGRACIÓN DE CHECKOUT Y PASARELAS DE PAGO
 * =========================================================================
 * 
 * Este archivo centraliza la lógica de interacción de todos los botones de compra
 * del ecosistema web de Saulibeth Rivas.
 * 
 * Diseñado para facilitar la integración por parte del desarrollador encargado
 * de conectar pasarelas como Stripe, PayPal, MercadoPago, Hotmart, Wompi, etc.
 * 
 * GUÍA RÁPIDA DE INTEGRACIÓN:
 * 1. Para pasarelas con URL externa (ej. Stripe Payment Links, Hotmart, PayPal.Me):
 *    - Configure la URL correspondiente en `CHECKOUT_CONFIG.products[courseId].checkoutUrl`.
 * 
 * 2. Para pasarelas con SDK / Checkout Modal en frontend (ej. Stripe.js, PayPal SDK):
 *    - Inserte el llamado a la API dentro de la función `CHECKOUT_CONFIG.onInitiateCheckout`.
 * 
 * 3. En el HTML, cada botón de compra cuenta con los atributos:
 *    - class="checkout-btn"
 *    - data-checkout-course="gestadoras" | "salud-mental" | "cef"
 *    - data-course-name="Nombre del Programa"
 *    - data-price="550"
 *    - data-currency="USD"
 * =========================================================================
 */

(function (window, document) {
  'use strict';

  // Configuración global de pasarela
  const CHECKOUT_CONFIG = {
    // Configuración de los programas disponibles
    products: {
      'gestadoras': {
        id: 'gestadoras',
        name: 'Triunfa Gestadoras',
        subtitle: 'Programa Insignia — Mentoría Grupal',
        price: 550,
        currency: 'USD',
        checkoutUrl: '' // Ingrese aquí la URL de checkout (ej: https://buy.stripe.com/...)
      },
      'salud-mental': {
        id: 'salud-mental',
        name: 'Triunfa con Salud Mental y Balance',
        subtitle: 'Mentoría 1 a 1 de Alta Dirección (16 semanas)',
        price: 1800,
        currency: 'USD',
        checkoutUrl: '' // Ingrese aquí la URL de checkout
      },
      'cef': {
        id: 'cef',
        name: 'Coaching para Emprendimiento Femenino (CEF)',
        subtitle: 'Programa de Acompañamiento y Expansión',
        price: 333,
        currency: 'USD',
        checkoutUrl: '' // Ingrese aquí la URL de checkout
      }
    },

    /**
     * HOOK PRINCIPAL: Disparado al hacer clic en cualquier botón de compra
     * @param {Object} product - Datos del producto ({ id, name, price, currency, checkoutUrl })
     * @param {HTMLElement} triggerBtn - Elemento que disparó el evento
     */
    onInitiateCheckout: function (product, triggerBtn) {
      console.log('[Saulibeth Checkout] Iniciando checkout para:', product);

      // CASO 1: Si ya se configuró una URL directa de pasarela, redirigir al checkout
      if (product.checkoutUrl && product.checkoutUrl.trim() !== '') {
        window.location.href = product.checkoutUrl;
        return;
      }

      // CASO 2: Pasarela en preparación (mostrar aviso elegante sin salir de la página)
      showCheckoutNotice(product);
    }
  };

  /**
   * Muestra un aviso modal sobrio y elegante acorde a la marca Saulibeth
   * cuando la pasarela aún no cuenta con una URL o SDK configurado.
   */
  function showCheckoutNotice(product) {
    let existingModal = document.getElementById('checkoutNoticeModal');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'checkoutNoticeModal';
    modal.className = 'checkout-notice-overlay';
    modal.innerHTML = `
      <div class="checkout-notice-card" role="dialog" aria-modal="true" aria-labelledby="checkoutNoticeTitle">
        <button class="checkout-notice-close" id="btnNoticeClose" aria-label="Cerrar aviso">&times;</button>
        <div class="checkout-notice-badge">Pasarela de Pago</div>
        <h3 class="checkout-notice-title" id="checkoutNoticeTitle">${product.name}</h3>
        <p class="checkout-notice-price">${product.currency === 'USD' ? '$' : ''}${product.price} <span class="checkout-notice-curr">${product.currency}</span></p>
        <p class="checkout-notice-desc">
          El módulo de pago en línea para este programa se encuentra actualmente en proceso de integración técnica y estará habilitado muy pronto.
        </p>
        <div class="checkout-notice-actions">
          <button type="button" class="btn-checkout-notice-close" id="btnNoticeAccept">Entendido</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Animación de entrada
    requestAnimationFrame(() => {
      modal.classList.add('active');
    });

    // Cierre
    function closeModal() {
      modal.classList.remove('active');
      setTimeout(() => {
        if (modal.parentNode) modal.remove();
      }, 300);
    }

    modal.querySelector('#btnNoticeClose').addEventListener('click', closeModal);
    modal.querySelector('#btnNoticeAccept').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Cerrar con Escape
    const onKey = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', onKey);
      }
    };
    document.addEventListener('keydown', onKey);
  }

  /**
   * Inyecta los estilos visuales para el modal de pasarela en preparación
   */
  function injectCheckoutStyles() {
    if (document.getElementById('checkoutStyles')) return;
    const style = document.createElement('style');
    style.id = 'checkoutStyles';
    style.textContent = `
      .checkout-notice-overlay {
        position: fixed;
        inset: 0;
        background: rgba(42, 26, 26, 0.65);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }
      .checkout-notice-overlay.active {
        opacity: 1;
        pointer-events: auto;
      }
      .checkout-notice-card {
        background: #FDFCFA;
        border: 1px solid rgba(151, 27, 37, 0.15);
        border-radius: 16px;
        max-width: 460px;
        width: 100%;
        padding: 2.8rem 2.2rem 2.2rem;
        position: relative;
        text-align: center;
        box-shadow: 0 25px 60px rgba(102, 10, 17, 0.25);
        transform: translateY(20px) scale(0.96);
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .checkout-notice-overlay.active .checkout-notice-card {
        transform: translateY(0) scale(1);
      }
      .checkout-notice-close {
        position: absolute;
        top: 1.1rem;
        right: 1.2rem;
        background: none;
        border: none;
        font-size: 1.8rem;
        line-height: 1;
        color: #971B25;
        cursor: pointer;
        opacity: 0.65;
        transition: opacity 0.2s, transform 0.2s;
      }
      .checkout-notice-close:hover {
        opacity: 1;
        transform: scale(1.1);
      }
      .checkout-notice-badge {
        display: inline-block;
        background: rgba(151, 27, 37, 0.08);
        color: #971B25;
        font-family: var(--font-body, -apple-system, sans-serif);
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        padding: 0.35rem 1rem;
        border-radius: 9999px;
        margin-bottom: 1.2rem;
        border: 1px solid rgba(151, 27, 37, 0.2);
      }
      .checkout-notice-title {
        font-family: var(--font-serif, "Cormorant Garamond", serif);
        font-size: 1.9rem;
        color: #660A11;
        margin: 0 0 0.5rem;
        font-weight: 500;
        line-height: 1.2;
      }
      .checkout-notice-price {
        font-family: var(--font-serif, "Cormorant Garamond", serif);
        font-size: 2.4rem;
        color: #971B25;
        font-weight: 600;
        margin: 0 0 1rem;
        line-height: 1;
      }
      .checkout-notice-curr {
        font-size: 1rem;
        font-weight: 400;
        color: #735959;
      }
      .checkout-notice-desc {
        font-family: var(--font-body, -apple-system, sans-serif);
        font-size: 0.95rem;
        line-height: 1.6;
        color: #4A3A3A;
        margin: 0 0 1.8rem;
      }
      .btn-checkout-notice-close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: #971B25;
        color: #ffffff;
        border: none;
        padding: 0.85rem 2.2rem;
        border-radius: 9999px;
        font-family: var(--font-body, -apple-system, sans-serif);
        font-size: 0.9rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        cursor: pointer;
        transition: background 0.3s, transform 0.2s;
        box-shadow: 0 4px 15px rgba(151, 27, 37, 0.25);
      }
      .btn-checkout-notice-close:hover {
        background: #660A11;
        transform: translateY(-2px);
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Inicializa los escuchadores de eventos para los botones de checkout
   */
  function initCheckoutButtons() {
    injectCheckoutStyles();

    const buttons = document.querySelectorAll('[data-checkout-course], .checkout-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const courseKey = btn.getAttribute('data-checkout-course') || 'gestadoras';
        const productInfo = CHECKOUT_CONFIG.products[courseKey] || {
          id: courseKey,
          name: btn.getAttribute('data-course-name') || 'Programa Saulibeth Rivas',
          price: parseFloat(btn.getAttribute('data-price')) || 0,
          currency: btn.getAttribute('data-currency') || 'USD',
          checkoutUrl: btn.getAttribute('data-checkout-url') || ''
        };

        CHECKOUT_CONFIG.onInitiateCheckout(productInfo, btn);
      });
    });
  }

  // Inicializar al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCheckoutButtons);
  } else {
    initCheckoutButtons();
  }

  // Exponer API pública en window para integración externa
  window.SaulibethCheckout = {
    config: CHECKOUT_CONFIG,
    initiate: function (courseKey) {
      const prod = CHECKOUT_CONFIG.products[courseKey];
      if (prod) {
        CHECKOUT_CONFIG.onInitiateCheckout(prod, null);
      }
    },
    setProductUrl: function (courseKey, url) {
      if (CHECKOUT_CONFIG.products[courseKey]) {
        CHECKOUT_CONFIG.products[courseKey].checkoutUrl = url;
      }
    }
  };

})(window, document);
