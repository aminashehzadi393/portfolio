/* Shared behavior: page fade, nav, reveals, 3D hero, stack layers,
   multi-depth 3D project cards, counters, form, copy email, to-top. */
(function () {
  'use strict';

  // Page fade-in
  document.addEventListener('DOMContentLoaded', function () {
    document.body.classList.add('loaded');
  });

  // Theme toggle (dark <-> light), persisted in localStorage
  var themeBtn = document.getElementById('themeToggle');
  var themeRoot = document.documentElement;
  try {
    if (localStorage.getItem('amina-theme') === 'light') themeRoot.setAttribute('data-theme', 'light');
  } catch (e) {}
  function updateToggleIcon() {
    if (!themeBtn) return;
    var light = themeRoot.getAttribute('data-theme') === 'light';
    themeBtn.textContent = light ? '\u263D' : '\u2600';
    themeBtn.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
  }
  if (themeBtn) {
    updateToggleIcon();
    themeBtn.addEventListener('click', function () {
      var light = themeRoot.getAttribute('data-theme') === 'light';
      if (light) themeRoot.removeAttribute('data-theme');
      else themeRoot.setAttribute('data-theme', 'light');
      try { localStorage.setItem('amina-theme', light ? 'dark' : 'light'); } catch (e) {}
      updateToggleIcon();
    });
  }

  // Mobile menu
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { navLinks.classList.remove('open'); });
    });
  }

  // Scroll reveal
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
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
      note.className = 'form-note';
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
          btn.textContent = 'Send Message';
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

  // Instant Website Checkup — client-side mini audit (the on-page lead hook)
  var maForm = document.getElementById('maForm');
  if (maForm) {
    var maOut = document.getElementById('maResults');
    var maUrl = document.getElementById('maUrl');

    function showMaMsg(text) {
      maOut.hidden = false;
      maOut.innerHTML = '';
      var p = document.createElement('p');
      p.className = 'ma-msg' + (text === 'ok' ? '' : '');
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

    function renderBlocked(url) {
      maOut.innerHTML = '';
      var wrap = document.createElement('div');
      wrap.className = 'ma-panel ma-panel-warn';
      var t = document.createElement('h3');
      t.textContent = 'Your site blocked the browser preview — most do.';
      var d = document.createElement('p');
      d.textContent = 'Servers often refuse to share their HTML with visitors\' browsers (CORS). No problem: I run the full audit server-side — up to 25 pages crawled, scored on SEO / AEO / GEO, with a plain-language PDF report and top quick wins. It\'s free, no sign-up.';
      var actions = document.createElement('div');
      actions.className = 'ma-actions';
      var a1 = document.createElement('a');
      a1.className = 'btn btn-primary';
      a1.href = 'contact.html';
      a1.textContent = 'Email my URL — get the full report →';
      a1.setAttribute('data-url', url.hostname);
      var a2 = document.createElement('a');
      a2.className = 'btn btn-ghost';
      a2.href = 'https://aminashehzadi393.github.io/seo-analyzer/';
      a2.setAttribute('target', '_blank');
      a2.setAttribute('rel', 'noopener');
      a2.textContent = '↗ Try RankCheck instead';
      actions.appendChild(a1); actions.appendChild(a2);
      wrap.appendChild(t); wrap.appendChild(d); wrap.appendChild(actions);
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
      if (score >= 90) return ['Excellent', '#34d399'];
      if (score >= 75) return ['Good', '#00e5ff'];
      if (score >= 50) return ['Needs Work', '#fbbf24'];
      return ['Poor', '#f87171'];
    }

    function renderMa(url, doc) {
      var checks = collectChecks(url, doc);
      var pillar = { seo: 100, aeo: 100, geo: 100 };
      var severe = { seo: 0, aeo: 0, geo: 0 };
      var failures = [];
      checks.forEach(function (c) {
        if (!c.ok) { failures.push(c); pillar[c.p] -= c.s * 22; severe[c.p] += c.s; }
      });
      pillar.seo = Math.max(5, Math.round(pillar.seo));
      pillar.aeo = Math.max(5, Math.round(pillar.aeo));
      pillar.geo = Math.max(5, Math.round(pillar.geo));
      var overall = Math.round(0.7 * pillar.seo + 0.15 * pillar.aeo + 0.15 * pillar.geo);
      var g = grade(overall);
      failures.sort(function (a, b) { return b.s - a.s; });

      maOut.innerHTML = '';
      var box = document.createElement('div');
      box.className = 'ma-panel';

      var head = document.createElement('div');
      head.className = 'ma-head';
      var ring = document.createElement('div');
      ring.className = 'ma-ring';
      ring.style.background = 'conic-gradient(' + g[1] + ' calc(' + overall + '%), rgba(0,229,255,.08) 0)';
      var ringIn = document.createElement('div');
      ringIn.className = 'ma-ring-in';
      var num = document.createElement('b');
      num.textContent = overall;
      var cap = document.createElement('small');
      cap.textContent = '/100 · ' + g[0].toUpperCase();
      cap.style.color = g[1];
      ringIn.appendChild(num); ringIn.appendChild(cap);
      ring.appendChild(ringIn);
      head.appendChild(ring);

      var headRight = document.createElement('div');
      headRight.className = 'ma-head-right';
      var hTitle = document.createElement('h3');
      hTitle.textContent = 'Readiness of ' + url.hostname;
      headRight.appendChild(hTitle);
      [['SEO', pillar.seo, 'Google findability'], ['AEO', pillar.aeo, 'Answers your visitors\' questions'], ['GEO', pillar.geo, 'AI assistants can cite you']].forEach(function (row) {
        var br = document.createElement('div');
        br.className = 'ma-bar-row';
        var lbl = document.createElement('span');
        lbl.className = 'ma-blbl';
        lbl.textContent = row[0] + ' — ' + row[2];
        var bar = document.createElement('span');
        bar.className = 'ma-bar';
        var fill = document.createElement('span');
        fill.className = 'ma-fill';
        fill.style.width = row[1] + '%';
        fill.style.background = row[1] >= 80 ? 'linear-gradient(90deg,#00e5ff,#34d399)' : row[1] >= 50 ? 'linear-gradient(90deg,#fbbf24,#00e5ff)' : 'linear-gradient(90deg,#f87171,#fbbf24)';
        var val = document.createElement('span');
        val.className = 'ma-bval';
        val.textContent = row[1] + '%';
        bar.appendChild(fill);
        br.appendChild(lbl); br.appendChild(bar); br.appendChild(val);
        headRight.appendChild(br);
      });
      head.appendChild(headRight);
      box.appendChild(head);

      if (failures.length) {
        var issuesTitle = document.createElement('div');
        issuesTitle.className = 'ma-sub';
        issuesTitle.textContent = 'Issues found (' + failures.length + ') — sorted by severity';
        box.appendChild(issuesTitle);
        failures.forEach(function (f) {
          var it = document.createElement('div');
          it.className = 'ma-issue';
          var dot = document.createElement('span');
          dot.className = 'sev-dot ' + (f.s >= 3 ? 'crit' : f.s === 2 ? 'warn' : 'info');
          var body = document.createElement('div');
          var b1 = document.createElement('strong');
          b1.textContent = f.label;
          var b2 = document.createElement('small');
          b2.textContent = f.fix;
          body.appendChild(b1); body.appendChild(b2);
          it.appendChild(dot); it.appendChild(body);
          box.appendChild(it);
        });
      } else {
        var allGood = document.createElement('div');
        allGood.className = 'ma-sub ok';
        allGood.textContent = '✔ All 13 checks passed — your basics are solid.';
        box.appendChild(allGood);
      }

      var actions = document.createElement('div');
      actions.className = 'ma-actions';
      var a1 = document.createElement('a');
      a1.className = 'btn btn-primary';
      a1.href = 'contact.html';
      a1.textContent = 'Unlock my FULL audit — up to 25 pages + PDF (free) →';
      var a2 = document.createElement('a');
      a2.className = 'btn btn-ghost';
      a2.href = 'https://aminashehzadi393.github.io/seo-analyzer/';
      a2.setAttribute('target', '_blank');
      a2.setAttribute('rel', 'noopener');
      a2.textContent = '↗ More checks with RankCheck';
      actions.appendChild(a1); actions.appendChild(a2);
      box.appendChild(actions);

      var fine = document.createElement('small');
      fine.className = 'ma-fineprint';
      fine.textContent = 'Preview based on best-practice rules run locally in your browser. Not a Google score. Amina also co-built a full crawl engine (SEO_skp): FastAPI · React · explainable scoring.';
      box.appendChild(fine);
      maOut.appendChild(box);
      maOut.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // 3D Tabs — clicking (or auto-cycle) swaps card panels with a 3D flip
  var tabBtns = Array.prototype.slice.call(document.querySelectorAll('.tab3d'));
  var tabPanes = Array.prototype.slice.call(document.querySelectorAll('.tabpane'));
  if (tabBtns.length && tabPanes.length) {
    var current = 0;
    var paused = false;
    var stage = document.querySelector('.tabstage');
    function setTab(idx, user) {
      current = (idx + tabBtns.length) % tabBtns.length;
      tabBtns.forEach(function (b, i) {
        b.classList.toggle('active', i === current);
        b.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });
      tabPanes.forEach(function (p, i) {
        p.classList.toggle('active', i === current);
      });
      if (user) paused = true;
    }
    tabBtns.forEach(function (b, i) {
      b.addEventListener('click', function () { setTab(i, true); });
    });
    if (stage) {
      stage.addEventListener('mouseenter', function () { paused = true; });
      stage.addEventListener('mouseleave', function () { paused = false; });
    }
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInterval(function () {
        if (!paused && !document.hidden) setTab(current + 1, false);
      }, 6000);
    }
  }

  // Multi-depth 3D matrix cards
  if (window.matchMedia('(pointer: fine)').matches) {
    var fine = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine) {
      document.querySelectorAll('.matrix-card').forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width;
          var py = (e.clientY - r.top) / r.height;
          var x = (px - 0.5), y = (py - 0.5);
          card.style.transform =
            'perspective(900px) rotateX(' + (-y * 9) + 'deg) rotateY(' + (x * 11) + 'deg)';
          card.style.setProperty('--mx', (px * 100) + '%');
          card.style.setProperty('--my', (py * 100) + '%');
        });
        card.addEventListener('mouseleave', function () { card.style.transform = ''; });
      });
    }
  }

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

  // Three.js hero: floating 3D SEO icons + ambient starfield (home page only)
  var canvas = document.getElementById('hero-canvas');
  if (canvas && typeof THREE !== 'undefined' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    try { initHero(canvas); } catch (e) { /* graceful: static hero remains */ }
  }

  function initHero(canvas) {
    var hero = canvas.closest('.hero');
    var isMobile = window.matchMedia('(max-width: 768px)').matches;
    var renderer = new THREE.WebGLRenderer({
      canvas: canvas, alpha: true, antialias: !isMobile, powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 140);
    camera.position.z = 30;

    // Studio lighting — the metal picks up moving highlights from these
    scene.add(new THREE.AmbientLight(0x1b2b4a, 1.1));
    var keyLight = new THREE.PointLight(0x00e5ff, 2.6, 90);
    scene.add(keyLight);
    var rimLight = new THREE.PointLight(0x8b5cf6, 2.2, 90);
    rimLight.position.set(-18, -10, 14);
    scene.add(rimLight);

    // Sculpture rig — parked to the right on desktop so text stays readable
    var rig = new THREE.Group();
    var rigBaseY = isMobile ? -4 : 0;
    rig.position.set(isMobile ? 0 : 7.5, rigBaseY, 0);
    if (isMobile) rig.scale.setScalar(0.8);
    scene.add(rig);

    function neon(color, opacity) {
      return new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: opacity });
    }

    // SEO concept: "Rank Ascent" — five steps climbing to position #1
    var barHeights = [1.1, 1.8, 2.6, 3.5, 4.6];
    for (var s = 0; s < barHeights.length; s++) {
      var topSpot = s === barHeights.length - 1;
      var bm = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, barHeights[s], 0.95),
        new THREE.MeshStandardMaterial({
          color: topSpot ? 0x0e5f8a : 0x14395c,
          metalness: 0.55,
          roughness: 0.35,
          emissive: topSpot ? 0x0891b2 : 0x000000,
          emissiveIntensity: topSpot ? 0.45 : 0
        })
      );
      bm.position.set(-2.4 + s * 1.2, barHeights[s] / 2, 0);
      rig.add(bm);
    }
    // Glowing marker floating over the #1 spot (a site claiming page one)
    var marker = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 18), neon(0x00e5ff, 0.95));
    marker.position.set(2.4, 5.6, 0.4);
    rig.add(marker);
    // Halo ring around the marker
    var halo = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.05, 8, 40), neon(0xfbbf24, 0.8));
    halo.position.copy(marker.position);
    rig.add(halo);
    // Thin magnifier ring arcing over the whole ranking — the SEO signature
    var mag = new THREE.Mesh(new THREE.TorusGeometry(5.4, 0.09, 10, 120), neon(0x00e5ff, 0.55));
    mag.rotation.set(Math.PI / 2.4, 0.35, 0);
    rig.add(mag);
    var magHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 2.6, 10), neon(0x00e5ff, 0.75));
    magHandle.position.set(5.1, -4.4, -0.6);
    magHandle.rotation.z = -Math.PI / 4 - Math.PI / 2.4;
    rig.add(magHandle);

    // Thin glowing orbit rings
    function orbit(radius, tiltX, tiltY, color, opacity) {
      var r = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.07, 8, 140),
        new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: opacity })
      );
      r.rotation.set(tiltX, tiltY, 0);
      rig.add(r);
      return r;
    }
    var ring1 = orbit(10.5, Math.PI / 2.5, 0.3, 0x00e5ff, 0.5);
    var ring2 = orbit(13.5, Math.PI / 1.9, -0.5, 0x8b5cf6, 0.35);

    // Distant starfield — round points only, very dim
    var N = isMobile ? 28 : 70;
    var positions = new Float32Array(N * 3);
    var velocities = [];
    for (var i = 0; i < N; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 70;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 34;
      positions[i * 3 + 2] = -6 - Math.random() * 22;
      velocities.push({
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: 0
      });
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var stars = new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0x7fdcff, size: 0.18, transparent: true, opacity: 0.35,
      sizeAttenuation: true, depthWrite: false
    }));
    scene.add(stars);

    var mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', function (e) {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    if (isMobile) {
      setInterval(function () {
        mouseX = Math.sin(Date.now() / 4000) * 0.5;
        mouseY = Math.cos(Date.now() / 5000) * 0.4;
      }, 4000);
    }

    function resize() {
      var w = hero.clientWidth, h = hero.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    var running = true;
    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (running) animate();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var vis = entries[0].isIntersecting;
        if (vis && !running) { running = true; animate(); }
        else if (!vis) { running = false; }
      }).observe(hero);
    }

    var clock0 = performance.now();
    function animate() {
      if (!running) return;
      requestAnimationFrame(animate);
      var t = (performance.now() - clock0) * 0.001;

      // gentle sway only — keeps the ranking sculpture readable, never spinny
      rig.rotation.y = Math.sin(t * 0.22) * 0.22;
      marker.position.y = 5.6 + Math.sin(t * 1.3) * 0.35;
      halo.position.y = marker.position.y;
      halo.rotation.z = t * 0.6;
      mag.rotation.z = Math.sin(t * 0.18) * 0.08;
      ring1.rotation.z = Math.sin(t * 0.3) * 0.15;
      ring2.rotation.z = -Math.sin(t * 0.26) * 0.12;
      rig.position.y = rigBaseY + Math.sin(t * 0.55) * 0.4;

      // sweeping key light: highlights glide across the metal
      keyLight.position.set(Math.cos(t * 0.4) * 22, 12, Math.sin(t * 0.4) * 16 + 6);

      var p = geo.attributes.position.array;
      for (var i = 0; i < N; i++) {
        p[i * 3] += velocities[i].x;
        p[i * 3 + 1] += velocities[i].y;
        if (p[i * 3] > 35 || p[i * 3] < -35) velocities[i].x *= -1;
        if (p[i * 3 + 1] > 17 || p[i * 3 + 1] < -17) velocities[i].y *= -1;
      }
      geo.attributes.position.needsUpdate = true;

      camera.position.x += (mouseX * (isMobile ? 0.8 : 2.2) - camera.position.x) * 0.04;
      camera.position.y += (-mouseY * (isMobile ? 0.6 : 1.3) - camera.position.y) * 0.04;
      camera.lookAt(rig.position.x * 0.6, 0, 0);
      renderer.render(scene, camera);
    }
    animate();
  }
})();
