/**
 * MOLMOL GAMES — main.js
 * Module pattern · header, nav, filters, forms, modals, motion
 */
(function () {
  'use strict';

  var Molmol = {};

  /* ---------- Utils ---------- */
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function prefersReduced() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ---------- Custom cursor ---------- */
  Molmol.cursor = {
    init: function () {
      if (window.matchMedia('(max-width: 1023px)').matches) return;
      if (prefersReduced()) return;
      var ring = document.createElement('div');
      ring.className = 'custom-cursor';
      ring.setAttribute('aria-hidden', 'true');
      var dot = document.createElement('div');
      dot.className = 'custom-cursor-dot';
      dot.setAttribute('aria-hidden', 'true');
      document.body.appendChild(ring);
      document.body.appendChild(dot);

      var mx = 0, my = 0, rx = 0, ry = 0;
      document.addEventListener('mousemove', function (e) {
        mx = e.clientX; my = e.clientY;
        dot.style.left = mx + 'px';
        dot.style.top = my + 'px';
      });

      function raf() {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      var hoverables = 'a, button, .btn, input, textarea, select, [role="button"]';
      document.addEventListener('mouseover', function (e) {
        if (e.target.closest(hoverables)) ring.classList.add('is-hover');
      });
      document.addEventListener('mouseout', function (e) {
        if (e.target.closest(hoverables)) ring.classList.remove('is-hover');
      });
    }
  };

  /* ---------- Scroll progress ---------- */
  Molmol.progress = {
    init: function () {
      var bar = qs('.scroll-progress');
      if (!bar) return;
      function update() {
        var h = document.documentElement;
        var max = h.scrollHeight - h.clientHeight;
        var pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
        bar.style.width = pct + '%';
      }
      window.addEventListener('scroll', update, { passive: true });
      update();
    }
  };

  /* ---------- Header ---------- */
  Molmol.header = {
    init: function () {
      var header = qs('.site-header');
      if (!header) return;
      function onScroll() {
        header.classList.toggle('is-scrolled', window.scrollY > 40);
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      var toggle = qs('.menu-toggle');
      var mobile = qs('.nav-mobile');
      if (!toggle || !mobile) return;

      function closeMenu() {
        toggle.setAttribute('aria-expanded', 'false');
        mobile.classList.remove('is-open');
        document.body.style.overflow = '';
        if (window.MolmolI18n) {
          toggle.setAttribute('aria-label', MolmolI18n.t('menu_open'));
        }
      }
      function openMenu() {
        toggle.setAttribute('aria-expanded', 'true');
        mobile.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        if (window.MolmolI18n) {
          toggle.setAttribute('aria-label', MolmolI18n.t('menu_close'));
        }
      }

      toggle.addEventListener('click', function () {
        if (mobile.classList.contains('is-open')) closeMenu();
        else openMenu();
      });

      qsa('a', mobile).forEach(function (a) {
        a.addEventListener('click', closeMenu);
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && mobile.classList.contains('is-open')) closeMenu();
      });
    }
  };

  /* ---------- Scroll reveal ---------- */
  Molmol.reveal = {
    init: function () {
      var els = qsa('.reveal');
      if (!els.length) return;
      if (prefersReduced() || !('IntersectionObserver' in window)) {
        els.forEach(function (el) { el.classList.add('is-visible'); });
        return;
      }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      els.forEach(function (el) { io.observe(el); });
    }
  };

  /* ---------- Modals ---------- */
  Molmol.modal = {
    init: function () {
      qsa('[data-modal-open]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var id = btn.getAttribute('data-modal-open');
          Molmol.modal.open(id);
        });
      });
      qsa('[data-modal-close]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          Molmol.modal.close(btn.closest('.modal-overlay'));
        });
      });
      qsa('.modal-overlay').forEach(function (overlay) {
        overlay.addEventListener('click', function (e) {
          if (e.target === overlay) Molmol.modal.close(overlay);
        });
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          qsa('.modal-overlay.is-open').forEach(function (o) { Molmol.modal.close(o); });
        }
      });
    },
    open: function (id) {
      var overlay = qs('#' + id);
      if (!overlay) return;
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      var focusable = qs('button, [href], input', overlay);
      if (focusable) focusable.focus();
    },
    close: function (overlay) {
      if (!overlay) return;
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  /* ---------- News filter ---------- */
  Molmol.newsFilter = {
    init: function () {
      var bar = qs('.filter-bar');
      if (!bar) return;
      var buttons = qsa('.filter-btn', bar);
      var items = qsa('.news-item');

      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var filter = btn.getAttribute('data-filter');
          buttons.forEach(function (b) {
            b.classList.toggle('is-active', b === btn);
            b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
          });
          items.forEach(function (item) {
            var cat = item.getAttribute('data-category');
            var show = filter === 'all' || cat === filter;
            item.hidden = !show;
          });
        });
      });
    }
  };

  /* ---------- Recruit accordion + filter ---------- */
  Molmol.recruit = {
    init: function () {
      qsa('.position-toggle').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var item = btn.closest('.position-item');
          var open = item.classList.contains('is-open');
          qsa('.position-item.is-open').forEach(function (el) {
            el.classList.remove('is-open');
            qs('.position-toggle', el).setAttribute('aria-expanded', 'false');
          });
          if (!open) {
            item.classList.add('is-open');
            btn.setAttribute('aria-expanded', 'true');
          }
        });
      });

      var filterBar = qs('.recruit-filter');
      if (!filterBar) return;
      qsa('.filter-btn', filterBar).forEach(function (btn) {
        btn.addEventListener('click', function () {
          var filter = btn.getAttribute('data-filter');
          qsa('.filter-btn', filterBar).forEach(function (b) {
            b.classList.toggle('is-active', b === btn);
          });
          qsa('.position-item').forEach(function (item) {
            var team = item.getAttribute('data-team');
            item.hidden = !(filter === 'all' || team === filter);
          });
        });
      });
    }
  };

  /* ---------- Contact form ---------- */
  Molmol.contact = {
    init: function () {
      var form = qs('#contact-form');
      if (!form) return;
      var success = qs('#form-success');

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var valid = true;
        var fields = [
          { id: 'name', check: function (v) { return v.trim().length >= 2; } },
          { id: 'email', check: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); } },
          { id: 'type', check: function (v) { return v !== ''; } },
          { id: 'message', check: function (v) { return v.trim().length >= 10; } }
        ];

        fields.forEach(function (f) {
          var group = qs('[data-field="' + f.id + '"]');
          var input = qs('#' + f.id);
          if (!group || !input) return;
          var ok = f.check(input.value);
          group.classList.toggle('has-error', !ok);
          if (!ok) valid = false;
        });

        var privacy = qs('#privacy');
        var privacyGroup = qs('[data-field="privacy"]');
        if (privacy && privacyGroup) {
          var okP = privacy.checked;
          privacyGroup.classList.toggle('has-error', !okP);
          if (!okP) valid = false;
        }

        if (!valid) {
          var firstErr = qs('.form-group.has-error .form-control, .checkbox-group.has-error input');
          if (firstErr) firstErr.focus();
          return;
        }

        form.hidden = true;
        if (success) {
          success.classList.add('is-visible');
          success.setAttribute('tabindex', '-1');
          success.focus();
        }
      });

      var resetBtn = qs('[data-form-reset]');
      if (resetBtn) {
        resetBtn.addEventListener('click', function () {
          form.reset();
          form.hidden = false;
          if (success) success.classList.remove('is-visible');
          qsa('.has-error', form).forEach(function (g) { g.classList.remove('has-error'); });
        });
      }
    }
  };

  /* ---------- Store notify ---------- */
  Molmol.store = {
    init: function () {
      var notifyForm = qs('#notify-form');
      if (!notifyForm) return;
      notifyForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = qs('#notify-email');
        var err = qs('#notify-error');
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
          if (err) { err.style.display = 'block'; err.textContent = '유효한 이메일을 입력해 주세요.'; }
          return;
        }
        if (err) err.style.display = 'none';
        var body = qs('.modal-notify-body');
        var done = qs('.modal-notify-done');
        if (body) body.hidden = true;
        if (done) { done.hidden = false; }
      });
    }
  };

  /* ---------- Back to top ---------- */
  Molmol.backToTop = {
    init: function () {
      qsa('.back-to-top').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: prefersReduced() ? 'auto' : 'smooth' });
        });
      });
    }
  };

  /* ---------- Current nav highlight ---------- */
  Molmol.navCurrent = {
    init: function () {
      var path = window.location.pathname.split('/').pop() || 'index.html';
      qsa('.nav-desktop a, .nav-mobile a, .footer-nav a').forEach(function (a) {
        var href = a.getAttribute('href');
        if (!href) return;
        var file = href.split('#')[0].split('/').pop();
        if (file === path || (path === '' && file === 'index.html')) {
          a.setAttribute('aria-current', 'page');
        }
      });
    }
  };

  /* ---------- Boot ---------- */
  function boot() {
    if (window.MolmolI18n) MolmolI18n.init();
    Molmol.cursor.init();
    Molmol.progress.init();
    Molmol.header.init();
    Molmol.reveal.init();
    Molmol.modal.init();
    Molmol.newsFilter.init();
    Molmol.recruit.init();
    Molmol.contact.init();
    Molmol.store.init();
    Molmol.backToTop.init();
    Molmol.navCurrent.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.Molmol = Molmol;
})();
