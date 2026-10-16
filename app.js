/* ============================================================
   Amina Shehzadi — Portfolio
   Vanilla JS: 3D hero, tilt, scrollspy, reveal, form, utilities
   ============================================================ */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Three.js hero background ---------- */
  function initHeroScene() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas || prefersReducedMotion) return;
    if (typeof THREE === 'undefined') return; // CDN failed — degrade gracefully

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    } catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 7;

    // Particle field
    var COUNT = 450;
    var positions = new Float32Array(COUNT * 3);
    for (var i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var mat = new THREE.PointsMaterial({
      color: 0x34d399, size: 0.035, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    var particles = new THREE.Points(geo, mat);
    scene.add(particles);

    // Floating wireframe shapes — slow, elegant
    var shapes = [];
    var shapeGeos = [
      new THREE.IcosahedronGeometry(1.1, 0),
      new THREE.OctahedronGeometry(0.9, 0),
      new THREE.TetrahedronGeometry(1.0, 0)
    ];
    var shapePos = [[-4.2, 1.4, -1.5], [4.4, -1.2, -2], [0.4, 2.4, -3]];
    for (var s = 0; s < shapeGeos.length; s++) {
      var mesh = new THREE.Mesh(shapeGeos[s], new THREE.MeshBasicMaterial({
        color: 0x34d399, wireframe: true, transparent: true, opacity: 0.10
      }));
      mesh.position.set(shapePos[s][0], shapePos[s][1], shapePos[s][2]);
      mesh.userData = { rx: 0.0012 + s * 0.0006, ry: 0.0018 + s * 0.0004, baseY: shapePos[s][1], ph: s * 2.1 };
      scene.add(mesh);
      shapes.push(mesh);
    }

    function resize() {
      var w = canvas.clientWidth || window.innerWidth;
      var h = canvas.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    var running = true;
    var heroVisible = true;

    // Pause when tab hidden or hero off-screen (perf)
    document.addEventListener('visibilitychange', function () {
      running = !document.hidden && heroVisible;
      if (running) requestAnimationFrame(tick);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        var shouldRun = !document.hidden && heroVisible;
        if (shouldRun && !running) { running = true; requestAnimationFrame(tick); }
        else if (!shouldRun) { running = false; }
      }).observe(document.getElementById('home'));
    }

    var mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', function (e) {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.6;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.4;
    }, { passive: true });

    var t = 0;
    function tick() {
      if (!running) return;
      t += 0.008;
      particles.rotation.y += 0.0006;
      particles.rotation.x = mouseY * 0.15;
      for (var k = 0; k < shapes.length; k++) {
        var m = shapes[k];
        m.rotation.x += m.userData.rx;
        m.rotation.y += m.userData.ry;
        m.position.y = m.userData.baseY + Math.sin(t + m.userData.ph) * 0.25;
      }
      camera.position.x += (mouseX - camera.position.x) * 0.03;
      camera.position.y += (-mouseY - camera.position.y) * 0.03;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }
    tick();
  }

  /* ---------- 2. Mobile menu ---------- */
  function initMenu() {
    var btn = document.getElementById('hamburger');
    var links = document.getElementById('nav-links');
    if (!btn || !links) return;
    btn.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      btn.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- 3. Navbar scrolled state ---------- */
  function initNavbar() {
    var nav = document.getElementById('navbar');
    if (!nav) return;
    function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 10); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 4. Scrollspy ---------- */
  function initScrollspy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (l) { map[l.getAttribute('href').slice(1)] = l; });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('active'); });
          var link = map[en.target.id];
          if (link) link.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) obs.observe(sec);
    });
  }

  /* ---------- 5. Scroll reveal ---------- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('visible');
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { obs.observe(el); });
  }

  /* ---------- 6. 3D tilt on showcase visuals ---------- */
  function initTilt() {
    if (prefersReducedMotion) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    document.querySelectorAll('.tilt').forEach(function (el) {
      var raf = null;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.style.transform =
            'rotateY(' + (px * 10).toFixed(2) + 'deg) rotateX(' + (-py * 10).toFixed(2) + 'deg) translateZ(8px)';
        });
      });
      el.addEventListener('mouseleave', function () {
        if (raf) cancelAnimationFrame(raf);
        el.style.transform = 'rotateY(0deg) rotateX(0deg) translateZ(0)';
      });
    });
  }

  /* ---------- 7. Contact form (formsubmit AJAX) ---------- */
  function initForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var name = document.getElementById('form-name');
    var email = document.getElementById('form-email');
    var message = document.getElementById('form-message');
    var status = document.getElementById('form-status');
    var submit = document.getElementById('form-submit');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.textContent = '';
      status.className = '';

      var n = name.value.trim(), em = email.value.trim(), msg = message.value.trim();
      if (!n || !em || !msg) {
        status.textContent = 'Please fill in all fields.';
        status.className = 'error';
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
        status.textContent = 'Please enter a valid email address.';
        status.className = 'error';
        return;
      }

      submit.disabled = true;
      submit.textContent = 'Sending…';

      fetch('https://formsubmit.co/aminashehzadi393@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: n, email: em, message: msg,
          _subject: 'Portfolio contact: ' + n,
          _template: 'table'
        })
      })
        .then(function (res) {
          if (!res.ok) throw new Error('bad response');
          return res.json();
        })
        .then(function () {
          status.textContent = 'Message sent — thank you! I\'ll get back to you soon.';
          status.className = 'success';
          form.reset();
        })
        .catch(function () {
          status.textContent = 'Something went wrong. Please email me directly at aminashehzadi393@gmail.com.';
          status.className = 'error';
        })
        .finally(function () {
          submit.disabled = false;
          submit.textContent = 'Send Message';
        });
    });
  }

  /* ---------- 8. Copy email ---------- */
  function initCopyEmail() {
    var btn = document.getElementById('copy-email');
    var text = document.getElementById('email-text');
    if (!btn || !text) return;
    btn.addEventListener('click', function () {
      var value = text.textContent.trim();
      function done() {
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done).catch(function () { fallback(); });
      } else { fallback(); }
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = value;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        done();
      }
    });
  }

  /* ---------- 9. Back to top ---------- */
  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', function () {
      btn.classList.toggle('show', window.scrollY > 600);
    }, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- 10. Footer year ---------- */
  function initYear() {
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- boot ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initHeroScene();
    initMenu();
    initNavbar();
    initScrollspy();
    initReveal();
    initTilt();
    initForm();
    initCopyEmail();
    initBackToTop();
    initYear();
  });
})();
