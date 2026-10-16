/* Shared behavior: page fade, nav, reveals, 3D hero, form, copy email, to-top. */
(function () {
  'use strict';

  // Page fade-in
  document.addEventListener('DOMContentLoaded', function () {
    document.body.classList.add('loaded');
  });

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
        body: JSON.stringify({ name: name, email: email, message: msg, _subject: 'Portfolio contact: ' + name })
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

  // Three.js neural-network hero (home page only)
  var canvas = document.getElementById('hero-canvas');
  if (canvas && typeof THREE !== 'undefined' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    try { initHero(canvas); } catch (e) { /* graceful: static hero remains */ }
  }

  function initHero(canvas) {
    var hero = canvas.closest('.hero');
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 26;

    var N = 90;
    var positions = new Float32Array(N * 3);
    var velocities = [];
    for (var i = 0; i < N; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 44;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 26;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.01
      });
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var mat = new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.22, transparent: true, opacity: 0.9 });
    var points = new THREE.Points(geo, mat);
    scene.add(points);

    var lineGeo = new THREE.BufferGeometry();
    var linePos = new Float32Array(N * N * 6);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    var lineMat = new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.14 });
    var lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    // Amber accent nodes
    var accentGeo = new THREE.BufferGeometry();
    var AN = 14;
    var aPos = new Float32Array(AN * 3);
    for (var j = 0; j < AN; j++) {
      aPos[j * 3] = (Math.random() - 0.5) * 36;
      aPos[j * 3 + 1] = (Math.random() - 0.5) * 22;
      aPos[j * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    accentGeo.setAttribute('position', new THREE.BufferAttribute(aPos, 3));
    var accent = new THREE.Points(accentGeo, new THREE.PointsMaterial({ color: 0xfbbf24, size: 0.34, transparent: true, opacity: 0.95 }));
    scene.add(accent);

    var mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', function (e) {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

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

    var LINK_DIST = 7;
    function animate() {
      if (!running) return;
      requestAnimationFrame(animate);
      var p = geo.attributes.position.array;
      for (var i = 0; i < N; i++) {
        p[i * 3] += velocities[i].x;
        p[i * 3 + 1] += velocities[i].y;
        p[i * 3 + 2] += velocities[i].z;
        if (p[i * 3] > 22 || p[i * 3] < -22) velocities[i].x *= -1;
        if (p[i * 3 + 1] > 13 || p[i * 3 + 1] < -13) velocities[i].y *= -1;
        if (p[i * 3 + 2] > 10 || p[i * 3 + 2] < -10) velocities[i].z *= -1;
      }
      geo.attributes.position.needsUpdate = true;

      var lp = lineGeo.attributes.position.array;
      var k = 0;
      for (var a = 0; a < N; a++) {
        for (var b = a + 1; b < N; b++) {
          var dx = p[a * 3] - p[b * 3], dy = p[a * 3 + 1] - p[b * 3 + 1], dz = p[a * 3 + 2] - p[b * 3 + 2];
          if (dx * dx + dy * dy + dz * dz < LINK_DIST * LINK_DIST) {
            lp[k++] = p[a * 3]; lp[k++] = p[a * 3 + 1]; lp[k++] = p[a * 3 + 2];
            lp[k++] = p[b * 3]; lp[k++] = p[b * 3 + 1]; lp[k++] = p[b * 3 + 2];
          }
        }
      }
      lineGeo.setDrawRange(0, k / 3);
      lineGeo.attributes.position.needsUpdate = true;

      accent.rotation.y += 0.0009;
      camera.position.x += (mouseX * 2.5 - camera.position.x) * 0.03;
      camera.position.y += (-mouseY * 1.5 - camera.position.y) * 0.03;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    }
    animate();
  }

  // Subtle card lift (pointer devices only)
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'translateY(-5px) rotateX(' + (-y * 4) + 'deg) rotateY(' + (x * 4) + 'deg)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }
})();
