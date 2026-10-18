/* Shared behavior for the light-glass 3D design:
   page load, mobile menu, reveals, scroll progress, counters,
   tilt engine, three.js daylight studio, instant checkup,
   contact form, copy email, back-to-top. */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    document.body.classList.add('loaded');
  });

  // Theme persistence is unused in the light-only design; safe no-op cleanup
  try { localStorage.removeItem('amina-theme'); } catch (e) {}

  // Scroll progress bar
  var bar = document.getElementById('scrollProgress');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'scrollProgress';
    document.body.appendChild(bar);
  }
  window.addEventListener('scroll', function () {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  }, { passive: true });

  // Mobile menu
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      navLinks.classList.toggle('hidden');
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { navLinks.classList.add('hidden'); });
    });
  }

  // Scroll reveal
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  // Back to top
  var toTop = document.getElementById('toTop');
  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('show', window.scrollY > 500);
    }, { passive: true });
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Footer year
  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  // Copy email
  var copyBtn = document.getElementById('copyEmail');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var email = copyBtn.getAttribute('data-email') || 'aminashehzadi393@gmail.com';
      function done() {
        var old = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(function () { copyBtn.textContent = old; }, 1600);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done).catch(function () { fallback(); });
      } else { fallback(); }
      function fallback() {
        var t = document.createElement('textarea');
        t.value = email;
        document.body.appendChild(t);
        t.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(t);
        done();
      }
    });
  }

  // Contact form via formsubmit AJAX
  var form = document.getElementById('contactForm');
  if (form) {
    var note = document.getElementById('formNote');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var name = document.getElementById('fName').value.trim();
      var email = document.getElementById('fEmail').value.trim();
      var msg = document.getElementById('fMsg').value.trim();
      var autoresp = form.querySelector('input[name="_autoresponse"]');
      if (!name || !email || !msg) {
        note.textContent = 'Please fill in your name, email and message.';
        note.className = 'form-note err';
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending…';
      note.textContent = '';
      fetch('https://formsubmit.co/ajax/aminashehzadi393@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          message: msg,
          _subject: 'Portfolio contact: ' + name,
          _autoresponse: autoresp ? autoresp.value : ''
        })
      }).then(function (r) { return r.json(); })
        .then(function () {
          note.textContent = 'Message sent! I will get back to you soon.';
          note.className = 'form-note ok';
          form.reset();
        })
        .catch(function () {
          note.textContent = 'Something went wrong. Please email me directly at aminashehzadi393@gmail.com.';
          note.className = 'form-note err';
        })
        .finally(function () {
          btn.disabled = false;
          btn.textContent = 'Send Project Brief';
        });
    });
  }

  // Animated stat counters
  var counters = document.querySelectorAll('.stat-num[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var el = e.target;
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        var t0 = performance.now();
        (function tick(now) {
          var prog = Math.min((now - t0) / 1400, 1);
          var eased = 1 - Math.pow(1 - prog, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (prog < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  // Extreme 3D card tilt + dynamic shadow shift (reference engine)
  if (window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.card-3d-light').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var rotateX = ((y - centerY) / centerY) * -10;
        var rotateY = ((x - centerX) / centerX) * 10;
        var shadowX = ((x - centerX) / centerX) * -22;
        var shadowY = ((y - centerY) / centerY) * -22 + 30;
        card.style.transform = 'rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.02, 1.02, 1.02)';
        card.style.setProperty('--mouse-x', x + 'px');
        card.style.setProperty('--mouse-y', y + 'px');
        card.style.setProperty('--shadow-x', shadowX + 'px');
        card.style.setProperty('--shadow-y', shadowY + 'px');
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        card.style.setProperty('--shadow-x', '0px');
        card.style.setProperty('--shadow-y', '35px');
      });
    });
  }

  // ---------- Three.js daylight 3D studio (fixed full-page background) ----------
  var canvas = document.getElementById('bg-canvas');
  if (canvas && typeof THREE !== 'undefined' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    try { initStudio(); } catch (e) { /* graceful: static background remains */ }
  }

  function initStudio() {
    var isSmall = window.innerWidth < 768;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: !isSmall });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.5 : 2));

    // Studio lighting for light-theme 3D depth
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    var dirLight1 = new THREE.DirectionalLight(0x4f46e5, 1.8);
    dirLight1.position.set(6, 10, 8);
    scene.add(dirLight1);
    var dirLight2 = new THREE.DirectionalLight(0x06b6d4, 1.5);
    dirLight2.position.set(-8, -6, 5);
    scene.add(dirLight2);
    var pointLight = new THREE.PointLight(0xec4899, 1.4, 25);
    pointLight.position.set(0, 3, 6);
    scene.add(pointLight);

    // Main 3D sculpture: glossy translucent knot + wireframe shell
    var mainRig = new THREE.Group();
    scene.add(mainRig);
    var torusKnot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.35, 0.36, isSmall ? 90 : 140, 24),
      new THREE.MeshStandardMaterial({
        color: 0x6366f1, roughness: 0.18, metalness: 0.35, transparent: true, opacity: 0.22
      })
    );
    mainRig.add(torusKnot);
    var geoCage = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.6, 1),
      new THREE.MeshBasicMaterial({ color: 0x0891b2, wireframe: true, transparent: true, opacity: 0.22 })
    );
    mainRig.add(geoCage);

    // 3 gyroscopic orbit rings
    var ringMat = new THREE.MeshStandardMaterial({
      color: 0x4f46e5, roughness: 0.2, metalness: 0.5, transparent: true, opacity: 0.32
    });
    var gyro1 = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.025, 16, 100), ringMat);
    var gyro2 = new THREE.Mesh(new THREE.TorusGeometry(3.8, 0.02, 16, 100), ringMat);
    var gyro3 = new THREE.Mesh(new THREE.TorusGeometry(4.3, 0.015, 16, 100), ringMat);
    gyro1.rotation.x = Math.PI / 3;
    gyro2.rotation.y = Math.PI / 4;
    gyro3.rotation.z = Math.PI / 6;
    mainRig.add(gyro1, gyro2, gyro3);

    // Floating 3D satellites
    var satellites = [];
    var satGeometries = [
      new THREE.OctahedronGeometry(0.32, 0),
      new THREE.BoxGeometry(0.42, 0.42, 0.42),
      new THREE.IcosahedronGeometry(0.28, 0),
      new THREE.TorusGeometry(0.26, 0.08, 12, 32)
    ];
    var satColors = [0x4f46e5, 0x06b6d4, 0x8b5cf6, 0x3b82f6];
    var SAT_COUNT = isSmall ? 10 : 18;
    for (var i = 0; i < SAT_COUNT; i++) {
      var mesh = new THREE.Mesh(
        satGeometries[i % satGeometries.length],
        new THREE.MeshStandardMaterial({
          color: satColors[i % satColors.length],
          roughness: 0.2, metalness: 0.3, transparent: true, opacity: 0.45
        })
      );
      mesh.position.set(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 8 - 2
      );
      mesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.02,
        rotSpeedY: (Math.random() - 0.5) * 0.02,
        floatSpeed: 0.8 + Math.random() * 1.5,
        floatOffset: Math.random() * Math.PI * 2,
        baseY: mesh.position.y
      };
      scene.add(mesh);
      satellites.push(mesh);
    }

    function positionMainRig() {
      if (window.innerWidth > 1024) mainRig.position.set(2.8, 0.3, -1);
      else mainRig.position.set(0, 0.5, -2.5);
    }
    positionMainRig();
    camera.position.z = 8.5;

    var targetMouseX = 0, targetMouseY = 0, currentScrollY = 0;
    window.addEventListener('mousemove', function (e) {
      targetMouseX = (e.clientX / window.innerWidth) - 0.5;
      targetMouseY = (e.clientY / window.innerHeight) - 0.5;
    }, { passive: true });
    window.addEventListener('scroll', function () {
      currentScrollY = window.scrollY;
    }, { passive: true });
    window.addEventListener('resize', function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      positionMainRig();
    });

    var running = true;
    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (running) animateScene();
    });

    var clock = new THREE.Clock();
    function animateScene() {
      if (!running) return;
      requestAnimationFrame(animateScene);
      var t = clock.getElapsedTime();

      torusKnot.rotation.x = t * 0.35;
      torusKnot.rotation.y = t * 0.25;
      geoCage.rotation.y = -t * 0.18;
      geoCage.rotation.z = t * 0.1;
      gyro1.rotation.z = t * 0.4;
      gyro1.rotation.y = Math.sin(t * 0.5) * 0.4;
      gyro2.rotation.x = -t * 0.32;
      gyro3.rotation.y = t * 0.28;

      satellites.forEach(function (sat) {
        sat.rotation.x += sat.userData.rotSpeedX;
        sat.rotation.y += sat.userData.rotSpeedY;
        sat.position.y = sat.userData.baseY +
          Math.sin(t * sat.userData.floatSpeed + sat.userData.floatOffset) * 0.45 +
          (currentScrollY * 0.002);
      });

      mainRig.rotation.y += (targetMouseX * 1.3 - mainRig.rotation.y) * 0.06;
      mainRig.rotation.x += (targetMouseY * 1.3 - mainRig.rotation.x) * 0.06;
      mainRig.position.y = Math.sin(t * 1.1) * 0.25 - (currentScrollY * 0.0012);

      pointLight.position.x = targetMouseX * 10;
      pointLight.position.y = -targetMouseY * 10;

      renderer.render(scene, camera);
    }
    animateScene();
  }

  // ---------- Instant Website Checkup (client-side mini audit) ----------
  var maForm = document.getElementById('maForm');
  if (maForm) {
    var maOut = document.getElementById('maResults');
    var maUrl = document.getElementById('maUrl');

    function showMaMsg(text) {
      maOut.hidden = false;
      maOut.innerHTML = '';
      var p = document.createElement('p');
      p.className = 'ma-msg';
      p.textContent = text;
      maOut.appendChild(p);
      maOut.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    maForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var raw = maUrl.value.trim();
      if (!raw) { showMaMsg('Please enter a website address first.'); return; }
      if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
      var url;
      try { url = new URL(raw); }
      catch (e) { showMaMsg('That does not look like a valid website address.'); return; }
      maOut.hidden = false;
      maOut.innerHTML = '';
      var p = document.createElement('p');
      p.className = 'ma-msg';
      p.appendChild(Object.assign(document.createElement('span'), { className: 'live-pulse' }));
      p.appendChild(document.createTextNode(' Scanning '));
      var host = document.createElement('b');
      host.textContent = url.hostname;
      p.appendChild(host);
      p.appendChild(document.createTextNode(' — running 13 checks in your browser…'));
      maOut.appendChild(p);
      maOut.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      runMiniAudit(url);
    });

    function runMiniAudit(url) {
      var aborter = ('AbortController' in window) ? new AbortController() : null;
      var timer = setTimeout(function () { if (aborter) aborter.abort(); }, 9000);
      fetch(url.href, { mode: 'cors', redirect: 'follow', signal: aborter ? aborter.signal : undefined })
        .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.text(); })
        .then(function (html) {
          clearTimeout(timer);
          try { renderMa(url, new DOMParser().parseFromString(html, 'text/html')); }
          catch (e) { renderBlocked(url); }
        })
        .catch(function () {
          clearTimeout(timer);
          renderBlocked(url);
        });
    }

    function maEl(tag, cls, text) {
      var el = document.createElement(tag);
      if (cls) el.className = cls;
      if (text !== undefined) el.textContent = text;
      return el;
    }

    function renderBlocked(url) {
      maOut.innerHTML = '';
      var wrap = maEl('div', 'ma-panel ma-panel-warn');
      wrap.appendChild(maEl('h3', '', 'Your site blocked the browser preview — most do.'));
      wrap.appendChild(maEl('p', '', 'Servers often refuse to share their HTML with visitors\' browsers (CORS). No problem: I run the full audit server-side — up to 25 pages crawled, scored on SEO / AEO / GEO, with a plain-language PDF report and top quick wins. It\'s free, no sign-up.'));
      var actions = maEl('div', 'ma-actions');
      var a1 = maEl('a', 'btn-x px-6 py-3 rounded-xl text-white font-bold text-sm shadow-lg', 'Email my URL — get the full report →');
      a1.style.background = 'linear-gradient(90deg, #4f46e5, #06b6d4)';
      a1.href = 'contact.html';
      var a2 = maEl('a', 'btn-x px-6 py-3 rounded-xl border-2 font-bold text-sm', '↗ Open my 15-point SEO Analyzer');
      a2.style.borderColor = '#c7d2fe';
      a2.style.color = '#4f46e5';
      a2.href = 'analyzer.html?url=' + encodeURIComponent(url.href);
      actions.appendChild(a1); actions.appendChild(a2);
      wrap.appendChild(actions);
      maOut.appendChild(wrap);
    }

    function meta(doc, sel) {
      var el = doc.querySelector(sel);
      return el && el.getAttribute('content') || '';
    }

    function collectChecks(url, doc) {
      var title = (doc.title || '').trim();
      var desc = meta(doc, 'meta[name="description" i], meta[name="DESCRIPTION"]');
      var view = doc.querySelector('meta[name="viewport" i]');
      var robots = (meta(doc, 'meta[name="robots" i]') || '').toLowerCase();
      var h1s = doc.querySelectorAll('h1');
      var imgs = doc.querySelectorAll('img');
      var noAlt = 0;
      for (var im = 0; im < imgs.length; im++) {
        if (!imgs[im].getAttribute('alt')) noAlt++;
      }
      var bodyWords = (doc.body ? doc.body.textContent : '').trim().split(/\s+/).filter(Boolean).length;
      var listItems = doc.querySelectorAll('li, td, th, details');
      var schema = doc.querySelectorAll('script[type="application/ld+json"]');
      var ogT = meta(doc, 'meta[property="og:title" i]');
      var ogD = meta(doc, 'meta[property="og:description" i]');
      var links = doc.querySelectorAll('a[href*="/" ]').length;

      return [
        { p: 'seo', s: 3, ok: url.protocol === 'https:', label: 'HTTPS secure connection', fix: 'Move the site to HTTPS (SSL certificate).' },
        { p: 'seo', s: 2, ok: !!title && title.length >= 10 && title.length <= 70, label: 'Title tag (10–70 chars)', fix: 'Add a unique 10–70 character <title> to every page.' },
        { p: 'seo', s: 2, ok: !!desc && desc.length >= 50 && desc.length <= 160, label: 'Meta description (50–160 chars)', fix: 'Write a compelling 50–160 character meta description.' },
        { p: 'seo', s: 2, ok: h1s.length === 1, label: h1s.length === 1 ? 'Exactly one H1 heading' : h1s.length + ' H1 headings (want exactly 1)', fix: 'Use exactly one H1 per page.' },
        { p: 'seo', s: 3, ok: imgs.length === 0 || noAlt === 0, label: noAlt ? noAlt + ' image(s) missing ALT text' : 'All images have ALT text', fix: 'Add descriptive alt="" attributes to every image.' },
        { p: 'seo', s: 2, ok: robots.indexOf('noindex') === -1, label: robots.indexOf('noindex') >= 0 ? 'BLOCKED: page is noindex' : 'Page is indexable (no noindex)', fix: 'Remove the noindex robots meta tag.' },
        { p: 'seo', s: 2, ok: !!view, label: 'Mobile viewport configured', fix: 'Add the responsive viewport meta tag.' },
        { p: 'seo', s: 1, ok: !!doc.querySelector('link[rel="canonical" i]'), label: 'Canonical URL set', fix: 'Add a rel="canonical" link.' },
        { p: 'seo', s: 1, ok: !!doc.querySelector('link[rel*="icon" i]'), label: 'Favicon defined', fix: 'Add a favicon link tag.' },
        { p: 'seo', s: 1, ok: links >= 3, label: 'Internal links present', fix: 'Link related pages together (internal linking).' },
        { p: 'aeo', s: 2, ok: bodyWords >= 250, label: bodyWords + ' words of body text (need 250+)', fix: 'Publish at least 250 words that answer customer questions.' },
        { p: 'aeo', s: 1, ok: listItems.length >= 3, label: 'Answers are scannable (lists/tables)', fix: 'Break answers into lists, tables or FAQ blocks so they can be quoted by AI.' },
        { p: 'geo', s: 2, ok: schema.length > 0, label: 'Schema.org structured data (JSON-LD)', fix: 'Add JSON-LD schema so AI tools understand your business.' },
        { p: 'geo', s: 1, ok: !!(ogT && ogD), label: 'Open Graph (social/AI preview) tags', fix: 'Add og:title and og:description meta tags.' }
      ];
    }

    function grade(score) {
      if (score >= 90) return ['Excellent', '#059669'];
      if (score >= 75) return ['Good', '#0891b2'];
      if (score >= 50) return ['Needs Work', '#d97706'];
      return ['Poor', '#dc2626'];
    }

    function renderMa(url, doc) {
      var checks = collectChecks(url, doc);
      var pillar = { seo: 100, aeo: 100, geo: 100 };
      var failures = [];
      checks.forEach(function (c) {
        if (!c.ok) { failures.push(c); pillar[c.p] -= c.s * 22; }
      });
      pillar.seo = Math.max(5, Math.round(pillar.seo));
      pillar.aeo = Math.max(5, Math.round(pillar.aeo));
      pillar.geo = Math.max(5, Math.round(pillar.geo));
      var overall = Math.round(0.7 * pillar.seo + 0.15 * pillar.aeo + 0.15 * pillar.geo);
      var g = grade(overall);
      failures.sort(function (a, b) { return b.s - a.s; });

      maOut.innerHTML = '';
      var box = maEl('div', 'ma-panel');

      var head = maEl('div', 'ma-head');
      var ring = maEl('div', 'ma-ring');
      ring.style.background = 'conic-gradient(' + g[1] + ' calc(' + overall + '%), #e2e8f0 0)';
      var ringIn = maEl('div', 'ma-ring-in');
      ringIn.appendChild(maEl('b', '', String(overall)));
      var cap = maEl('small', '', '/100 · ' + g[0].toUpperCase());
      cap.style.color = g[1];
      ringIn.appendChild(cap);
      ring.appendChild(ringIn);
      head.appendChild(ring);

      var headRight = maEl('div', 'ma-head-right');
      headRight.appendChild(maEl('h3', '', 'Readiness of ' + url.hostname));
      [['SEO', pillar.seo, 'Google findability'], ['AEO', pillar.aeo, 'Answers your visitors\' questions'], ['GEO', pillar.geo, 'AI assistants can cite you']].forEach(function (row) {
        var br = maEl('div', 'ma-bar-row');
        br.appendChild(maEl('span', 'ma-blbl', row[0] + ' — ' + row[2]));
        var bar = maEl('span', 'ma-bar');
        var fill = maEl('span', 'ma-fill');
        fill.style.width = row[1] + '%';
        fill.style.background = row[1] >= 80 ? 'linear-gradient(90deg,#059669,#0891b2)' : row[1] >= 50 ? 'linear-gradient(90deg,#d97706,#0891b2)' : 'linear-gradient(90deg,#dc2626,#d97706)';
        bar.appendChild(fill);
        br.appendChild(bar);
        br.appendChild(maEl('span', 'ma-bval', row[1] + '%'));
        headRight.appendChild(br);
      });
      head.appendChild(headRight);
      box.appendChild(head);

      if (failures.length) {
        box.appendChild(maEl('div', 'ma-sub', 'Issues found (' + failures.length + ') — sorted by severity'));
        failures.forEach(function (f) {
          var it = maEl('div', 'ma-issue');
          it.appendChild(maEl('span', 'sev-dot ' + (f.s >= 3 ? 'crit' : f.s === 2 ? 'warn' : 'info')));
          var body = maEl('div', '');
          body.appendChild(maEl('strong', '', f.label));
          body.appendChild(maEl('small', '', f.fix));
          it.appendChild(body);
          box.appendChild(it);
        });
      } else {
        box.appendChild(maEl('div', 'ma-sub ok', '✔ All 13 checks passed — your basics are solid.'));
      }

      var actions = maEl('div', 'ma-actions');
      var a1 = maEl('a', 'btn-x px-6 py-3 rounded-xl text-white font-bold text-sm shadow-lg', 'Unlock my FULL audit — up to 25 pages + PDF (free) →');
      a1.style.background = 'linear-gradient(90deg, #4f46e5, #06b6d4)';
      a1.href = 'contact.html';
      var a2 = maEl('a', 'btn-x px-6 py-3 rounded-xl border-2 font-bold text-sm', '↗ Open my 15-point SEO Analyzer');
      a2.style.borderColor = '#c7d2fe';
      a2.style.color = '#4f46e5';
      a2.href = 'analyzer.html?url=' + encodeURIComponent(url.href);
      actions.appendChild(a1); actions.appendChild(a2);
      box.appendChild(actions);

      box.appendChild(maEl('small', 'ma-fineprint', 'Preview based on best-practice rules run locally in your browser. Not a Google score. Amina also co-built a full crawl engine (SEO_skp): FastAPI · React · explainable scoring.'));
      maOut.appendChild(box);
      maOut.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
})();
