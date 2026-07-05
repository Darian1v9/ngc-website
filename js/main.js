/* NEW GOLF CLUB – Theme, Sprache, Navigation, Animationen */
(function () {
  var root = document.documentElement;

  /* ---------- Dark / Light Mode ---------- */
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    var btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    try { localStorage.setItem('ngc-theme', theme); } catch (e) {}
  }
  var savedTheme;
  try { savedTheme = localStorage.getItem('ngc-theme'); } catch (e) {}
  if (!savedTheme) {
    savedTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  applyTheme(savedTheme);

  /* ---------- Sprache DE / EN ---------- */
  function applyLang(lang) {
    document.querySelectorAll('[data-en]').forEach(function (el) {
      if (!el.hasAttribute('data-de')) el.setAttribute('data-de', el.innerHTML);
      el.innerHTML = lang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-de');
    });
    root.setAttribute('lang', lang);
    var btn = document.getElementById('langToggle');
    if (btn) btn.textContent = lang === 'en' ? 'DE' : 'EN';
    try { localStorage.setItem('ngc-lang', lang); } catch (e) {}
  }

  /* ---------- Init nach DOM-Load ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    // Theme-Button
    var themeBtn = document.getElementById('themeToggle');
    if (themeBtn) themeBtn.addEventListener('click', function () {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });

    // Sprach-Button
    var savedLang;
    try { savedLang = localStorage.getItem('ngc-lang'); } catch (e) {}
    if (savedLang === 'en') applyLang('en');
    var langBtn = document.getElementById('langToggle');
    if (langBtn) langBtn.addEventListener('click', function () {
      applyLang(root.getAttribute('lang') === 'en' ? 'de' : 'en');
    });

    // Mobile Navigation
    var navBtn = document.querySelector('.nav-toggle');
    var nav = document.getElementById('nav');
    if (navBtn && nav) navBtn.addEventListener('click', function () {
      nav.classList.toggle('open');
    });

    // Scroll-Reveal-Animationen
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll('.reveal').forEach(function (el) { observer.observe(el); });
    } else {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
    }

    // Live-Wetter (Open-Meteo, kostenlos, kein API-Key)
    var weather = document.getElementById('weatherWidget');
    if (weather && window.fetch) {
      fetch('https://api.open-meteo.com/v1/forecast?latitude=48.4113&longitude=10.0187&current=temperature_2m,weather_code,wind_speed_10m&timezone=Europe%2FBerlin')
        .then(function (r) { return r.json(); })
        .then(function (d) {
          var c = d.current;
          var code = c.weather_code;
          function info(code) {
            if (code === 0) return ['☀️', 'Sonnig', 'Sunny'];
            if (code === 1) return ['🌤️', 'Überwiegend klar', 'Mostly clear'];
            if (code === 2) return ['⛅', 'Teils bewölkt', 'Partly cloudy'];
            if (code === 3) return ['☁️', 'Bedeckt', 'Overcast'];
            if (code === 45 || code === 48) return ['🌫️', 'Nebel', 'Fog'];
            if (code >= 51 && code <= 57) return ['🌦️', 'Nieselregen', 'Drizzle'];
            if (code >= 61 && code <= 67) return ['🌧️', 'Regen', 'Rain'];
            if (code >= 71 && code <= 77) return ['🌨️', 'Schneefall', 'Snow'];
            if (code >= 80 && code <= 82) return ['🌦️', 'Regenschauer', 'Showers'];
            if (code === 85 || code === 86) return ['🌨️', 'Schneeschauer', 'Snow showers'];
            if (code >= 95) return ['⛈️', 'Gewitter', 'Thunderstorm'];
            return ['🌡️', 'Wetter', 'Weather'];
          }
          var w = info(code);
          weather.innerHTML =
            '<div class="label" data-en="Weather on the course">Wetter am Platz</div>' +
            '<div class="value">' + w[0] + ' ' + Math.round(c.temperature_2m) + '°C · ' +
            '<span data-en="' + w[2] + '">' + w[1] + '</span></div>' +
            '<div style="font-size:.8rem;color:var(--text-muted);margin-top:2px;">' +
            '<span data-en="Wind">Wind</span> ' + Math.round(c.wind_speed_10m) + ' km/h</div>';
          applyLang(root.getAttribute('lang') || 'de');
        })
        .catch(function () { weather.style.display = 'none'; });
    }

    // Sanfter Parallax-Effekt im Hero
    var hero = document.querySelector('.hero-inner');
    if (hero && window.matchMedia('(min-width: 700px)').matches) {
      window.addEventListener('scroll', function () {
        var y = window.scrollY;
        if (y < 700) hero.style.transform = 'translateY(' + y * 0.18 + 'px)';
      }, { passive: true });
    }

    /* ---------- Special Effects ---------- */
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scroll-Fortschrittsbalken (oben)
    var progress = document.createElement('div');
    progress.id = 'scrollProgress';
    document.body.appendChild(progress);

    var header = document.querySelector('.site-header');
    var bands = [].slice.call(document.querySelectorAll('.photo-band'));

    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';
      if (header) header.classList.toggle('shrink', y > 40);
      if (!reduceMotion) {
        var vh = window.innerHeight;
        bands.forEach(function (b) {
          var r = b.getBoundingClientRect();
          if (r.bottom > 0 && r.top < vh) {
            var offset = ((r.top + r.height / 2) - vh / 2) / vh; // -1 .. 1
            b.style.setProperty('--par', (offset * -14).toFixed(1) + 'px');
          }
        });
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();

    // Hochzählende Kennzahlen
    var nums = document.querySelectorAll('.stat-num');
    if (nums.length) {
      var runCount = function (el) {
        var target = parseFloat(el.getAttribute('data-target')) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        if (reduceMotion) { el.innerHTML = target.toLocaleString('de-DE') + suffix; return; }
        var dur = 1400, start = null;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.innerHTML = Math.round(target * eased).toLocaleString('de-DE') + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      };
      if ('IntersectionObserver' in window) {
        var nObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { runCount(e.target); nObs.unobserve(e.target); }
          });
        }, { threshold: 0.5 });
        nums.forEach(function (el) { nObs.observe(el); });
      } else {
        nums.forEach(runCount);
      }
    }
  });
})();
