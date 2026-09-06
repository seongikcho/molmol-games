/**
 * MOLMOL GAMES — main.js
 * Header, panel nav, filters, forms, modals, reveal
 */
(function () {
  'use strict';

  var Molmol = {};

  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function prefersReduced() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* Header: scroll + theme */
  Molmol.header = {
    init: function () {
      var header = qs('.site-header');
      if (!header) return;

      var theme = header.getAttribute('data-theme') || 'light';
      header.classList.add(theme === 'dark' ? 'is-dark' : 'is-light');

      function onScroll() {
        header.classList.toggle('is-scrolled', window.scrollY > 24);
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      var toggle = qs('.menu-toggle');
      var panel = qs('.nav-panel');
      var closeBtn = qs('.nav-panel-close');
      var backdrop = qs('.nav-panel-backdrop');
      if (!toggle || !panel) return;
      panel.setAttribute('aria-hidden', 'true');

      function closeMenu() {
        toggle.setAttribute('aria-expanded', 'false');
        panel.classList.remove('is-open');
        panel.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (window.MolmolI18n) {
          toggle.setAttribute('aria-label', MolmolI18n.t('menu_open'));
        }
      }
      function openMenu() {
        toggle.setAttribute('aria-expanded', 'true');
        panel.classList.add('is-open');
        panel.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (window.MolmolI18n) {
          toggle.setAttribute('aria-label', MolmolI18n.t('menu_close'));
        }
        if (closeBtn) closeBtn.focus();
      }

      toggle.addEventListener('click', function () {
        if (panel.classList.contains('is-open')) closeMenu();
        else openMenu();
      });
      if (closeBtn) closeBtn.addEventListener('click', closeMenu);
      if (backdrop) backdrop.addEventListener('click', closeMenu);
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && panel.classList.contains('is-open')) closeMenu();
      });
      qsa('.nav-panel-links a').forEach(function (a) {
        a.addEventListener('click', closeMenu);
      });
    }
  };

  /* Reveal on scroll */
  Molmol.reveal = {
    init: function () {
      var els = qsa('.reveal');
      if (!els.length) return;
      if (prefersReduced() || !('IntersectionObserver' in window)) {
        els.forEach(function (el) { el.classList.add('is-in'); });
        return;
      }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('is-in');
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      els.forEach(function (el) { io.observe(el); });
    }
  };

  /* Filter bars (news / recruit) */
  Molmol.filters = {
    init: function () {
      qsa('.filter-bar').forEach(function (bar) {
        var btns = qsa('.filter-btn', bar);
        var scope = bar.closest('section') || bar.parentElement;
        var items = qsa('[data-category], [data-team]', scope.parentElement || document);
        // Prefer siblings list
        var list = qs('.news-list, .position-list', bar.parentElement) ||
                   qs('.news-list, .position-list', scope);
        if (list) items = qsa('[data-category], [data-team]', list);

        btns.forEach(function (btn) {
          btn.addEventListener('click', function () {
            var filter = btn.getAttribute('data-filter') || 'all';
            btns.forEach(function (b) {
              b.classList.toggle('is-active', b === btn);
              b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
            });
            items.forEach(function (item) {
              var cat = item.getAttribute('data-category') || item.getAttribute('data-team') || '';
              var show = filter === 'all' || cat === filter;
              item.classList.toggle('is-hidden', !show);
            });
          });
        });
      });
    }
  };

  /* Recruit accordion */
  Molmol.positions = {
    init: function () {
      qsa('.position-toggle').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var item = btn.closest('.position-item');
          var panel = qs('.position-panel', item);
          var open = btn.getAttribute('aria-expanded') === 'true';
          btn.setAttribute('aria-expanded', open ? 'false' : 'true');
          if (panel) panel.classList.toggle('is-open', !open);
        });
      });
    }
  };

  /* Modals */
  Molmol.modal = {
    init: function () {
      qsa('[data-modal-open]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-modal-open');
          var modal = qs('#' + id);
          if (!modal) return;
          modal.classList.add('is-open');
          document.body.style.overflow = 'hidden';
          var close = qs('.modal-close', modal);
          if (close) close.focus();
        });
      });
      qsa('.modal').forEach(function (modal) {
        function close() {
          modal.classList.remove('is-open');
          document.body.style.overflow = '';
        }
        var backdrop = qs('.modal-backdrop', modal);
        var closeBtn = qs('.modal-close', modal);
        if (backdrop) backdrop.addEventListener('click', close);
        if (closeBtn) closeBtn.addEventListener('click', close);
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
        });
      });
    }
  };

  /* Contact form */
  Molmol.form = {
    init: function () {
      var form = qs('#contact-form');
      if (!form) return;
      var success = qs('#form-success');

      function invalidate(group, on) {
        if (group) group.classList.toggle('is-invalid', !!on);
      }

      function validate() {
        var ok = true;
        var name = qs('#name', form);
        var email = qs('#email', form);
        var type = qs('#type', form);
        var message = qs('#message', form);
        var privacy = qs('#privacy', form);

        invalidate(name.closest('.form-group'), !name.value || name.value.trim().length < 2);
        if (!name.value || name.value.trim().length < 2) ok = false;

        var emailOk = email.value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
        invalidate(email.closest('.form-group'), !emailOk);
        if (!emailOk) ok = false;

        invalidate(type.closest('.form-group'), !type.value);
        if (!type.value) ok = false;

        invalidate(message.closest('.form-group'), !message.value || message.value.trim().length < 10);
        if (!message.value || message.value.trim().length < 10) ok = false;

        var privGroup = privacy.closest('.checkbox-group');
        invalidate(privGroup, !privacy.checked);
        var privErr = qs('#privacy-error');
        if (privErr) {
          privErr.textContent = privacy.checked ? '' : (document.body.classList.contains('lang-en')
            ? 'Please agree to privacy terms.'
            : '개인정보 수집·이용에 동의해 주세요.');
          privErr.style.display = privacy.checked ? 'none' : 'block';
        }
        if (!privacy.checked) ok = false;

        return ok;
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validate()) return;
        form.classList.add('is-hidden');
        if (success) {
          success.classList.add('is-visible');
          success.focus();
        }
      });

      qsa('[data-form-reset]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          form.reset();
          form.classList.remove('is-hidden');
          qsa('.is-invalid', form).forEach(function (el) { el.classList.remove('is-invalid'); });
          if (success) success.classList.remove('is-visible');
          var privErr = qs('#privacy-error');
          if (privErr) { privErr.textContent = ''; privErr.style.display = 'none'; }
        });
      });

      // Notify modal form
      var notifyForm = qs('#notify-form');
      if (notifyForm) {
        notifyForm.addEventListener('submit', function (e) {
          e.preventDefault();
          var em = qs('input[type="email"]', notifyForm);
          if (!em || !em.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value)) {
            em && em.focus();
            return;
          }
          notifyForm.reset();
          var modal = notifyForm.closest('.modal');
          if (modal) modal.classList.remove('is-open');
          document.body.style.overflow = '';
        });
      }
    }
  };

  /* Active nav highlight */
  Molmol.navActive = {
    init: function () {
      var path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
      if (!path || path === '') path = 'index.html';
      qsa('.nav-desktop a, .nav-panel-links a').forEach(function (a) {
        var href = (a.getAttribute('href') || '').toLowerCase();
        if (href === path) {
          a.classList.add('is-active');
          a.setAttribute('aria-current', 'page');
        }
      });
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (window.MolmolI18n) MolmolI18n.init();
    Molmol.header.init();
    Molmol.navActive.init();
    Molmol.reveal.init();
    Molmol.filters.init();
    Molmol.positions.init();
    Molmol.modal.init();
    Molmol.form.init();
  });
})();
