/* ============================================================
   js/toast.js — Gradie Toast Notification System
   ============================================================ */

(function () {
  'use strict';

  // ── Create container once ─────────────────────────────────────────────────
  function getContainer() {
    let c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      document.body.appendChild(c);
    }
    return c;
  }

  // ── Icon map ──────────────────────────────────────────────────────────────
  const ICONS = {
    success: '✓',
    error:   '✕',
    info:    'ℹ',
    warning: '⚠'
  };

  const TITLES = {
    success: 'Thành công',
    error:   'Lỗi',
    info:    'Thông báo',
    warning: 'Cảnh báo'
  };

  // ── Main function ─────────────────────────────────────────────────────────
  window.showToast = function (message, type = 'info', duration = 3500) {
    const container = getContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    toast.innerHTML = `
      <div class="toast-icon">${ICONS[type] || ICONS.info}</div>
      <div class="toast-body">
        <div class="toast-title">${TITLES[type] || TITLES.info}</div>
        <div class="toast-msg">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close">×</button>
    `;

    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => dismiss(toast));

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('show'));
    });

    // Auto dismiss
    const timer = setTimeout(() => dismiss(toast), duration);
    toast._timer = timer;

    return toast;
  };

  function dismiss(toast) {
    clearTimeout(toast._timer);
    toast.classList.remove('show');
    toast.classList.add('hide');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }

  // ── Convenience shorthands ───────────────────────────────────────────────
  window.showToastSuccess = (msg) => window.showToast(msg, 'success');
  window.showToastError   = (msg) => window.showToast(msg, 'error');
  window.showToastInfo    = (msg) => window.showToast(msg, 'info');
  window.showToastWarning = (msg) => window.showToast(msg, 'warning');
})();
