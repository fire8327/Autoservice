// ==========================================================================
// МТ АВТОКОМПЛЕКС — DATA-DRIVEN TEMPLATE HYDRATION ENGINE
// Автоматическая загрузка данных из data/service-data.json
// ==========================================================================

document.addEventListener('DOMContentLoaded', async () => {
  let appData = null;

  try {
    const res = await fetch('data/service-data.json');
    if (!res.ok) throw new Error('Network error');
    appData = await res.json();
  } catch (err) {
    console.warn('[Engine] Loading fallback data due to fetch error / file protocol:', err);
    if (window.FALLBACK_SERVICE_DATA) {
      appData = window.FALLBACK_SERVICE_DATA;
    }
  }

  if (!appData) {
    console.error('[Engine] Failed to load service data.');
    return;
  }

  // Hydrate DOM with data
  hydrateBrandAndContacts(appData);
  renderMetrics(appData);
  renderServices(appData);
  renderRadarControls(appData);
  renderReviews(appData);
  renderSpareParts(appData);
  initKitchenClock(appData);

  // Initialize Interactive Mileage Radar
  if (window.MileageRadarEngine) {
    new window.MileageRadarEngine(appData);
  }

  // Mobile menu toggle
  initMobileNav();

  // Initialize Advanced Automotive Animations
  initScrollReveal();
  initMetricCounters();
  initSpotlightCards();
  init3DTilt();
  initRippleEffect();
});

function hydrateBrandAndContacts(data) {
  const b = data.brand;
  const c = data.contacts;

  // Texts
  document.querySelectorAll('[data-bind="brand.name"]').forEach(el => el.textContent = b.name);
  document.querySelectorAll('[data-bind="brand.shortName"]').forEach(el => el.textContent = b.shortName);
  document.querySelectorAll('[data-bind="brand.city"]').forEach(el => el.textContent = b.city);
  document.querySelectorAll('[data-bind="brand.address"]').forEach(el => el.textContent = `${b.city}, ${b.address}`);
  document.querySelectorAll('[data-bind="brand.tagline"]').forEach(el => el.textContent = b.tagline);
  document.querySelectorAll('[data-bind="brand.subtagline"]').forEach(el => el.textContent = b.subtagline);
  document.querySelectorAll('[data-bind="brand.workHours"]').forEach(el => el.textContent = b.workHours);
  document.querySelectorAll('[data-bind="brand.rating"]').forEach(el => el.textContent = b.rating.toFixed(1));
  document.querySelectorAll('[data-bind="brand.reviewsCount"]').forEach(el => el.textContent = `${b.reviewsCount} отзывов`);

  // Phone links
  document.querySelectorAll('[data-bind="contacts.phonePrimary"]').forEach(el => {
    el.textContent = c.phonePrimary;
    if (el.tagName === 'A') el.href = `tel:${c.phonePrimaryRaw}`;
  });

  // Direct Socials
  document.querySelectorAll('[data-bind="contacts.telegram"]').forEach(el => {
    if (el.tagName === 'A') el.href = c.telegram;
  });
  document.querySelectorAll('[data-bind="contacts.whatsapp"]').forEach(el => {
    if (el.tagName === 'A') el.href = c.whatsapp;
  });
  document.querySelectorAll('[data-bind="contacts.vk"]').forEach(el => {
    if (el.tagName === 'A') el.href = c.vk;
  });
  document.querySelectorAll('[data-bind="contacts.yandexMap"]').forEach(el => {
    if (el.tagName === 'A') el.href = c.yandexMap;
  });
}

function renderMetrics(data) {
  const container = document.getElementById('metricsGrid');
  if (!container) return;

  container.innerHTML = data.metrics.map((m, idx) => `
    <div class="reveal-init delay-${idx + 1} border-l-2 border-accent pl-4 font-mono group hover:border-accentHover transition-all duration-200">
      <div class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight metric-counter" data-value="${m.value}">${m.value}</div>
      <div class="text-xs font-bold text-accent uppercase tracking-wider mt-0.5">${m.label}</div>
      <div class="text-[11px] text-textDim mt-0.5">${m.sub}</div>
    </div>
  `).join('');
}

function renderServices(data) {
  const container = document.getElementById('servicesGrid');
  if (!container) return;

  container.innerHTML = data.services.map((s, idx) => `
    <article class="service-card spotlight-card reveal-init delay-${(idx % 3) + 1} p-6 flex flex-col justify-between group">
      <div>
        <div class="flex items-center justify-between mb-4">
          <span class="service-badge font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-accent/5 border border-accent/20 text-accent rounded-sm transition-colors">
            ${s.badge}
          </span>
          <span class="font-mono text-xs text-textDim flex items-center gap-1">
            <span class="material-symbols-outlined text-xs text-accent">timer</span> ${s.duration}
          </span>
        </div>
        
        <h3 class="text-lg font-bold text-white group-hover:text-accent transition-colors mb-2">
          ${s.title}
        </h3>
        
        <p class="text-xs text-textMuted leading-relaxed mb-4">
          ${s.desc}
        </p>

        <ul class="space-y-1.5 mb-6 text-xs text-textMuted font-mono">
          ${s.points.map(pt => `
            <li class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-accent"></span>
              <span>${pt}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="pt-4 border-t border-border flex items-center justify-between">
        <div>
          <span class="text-[10px] text-textDim uppercase font-mono block">Стоимость работ</span>
          <span class="text-xl font-bold font-mono text-white">${s.pricePrefix ? s.pricePrefix + ' ' : ''}${s.price.toLocaleString('ru-RU')} ₽</span>
        </div>
        <a href="#radar" class="btn-precision-ghost text-xs py-2 px-3">
          В наряд ТО
        </a>
      </div>
    </article>
  `).join('');
}

function renderRadarControls(data) {
  const stepperContainer = document.getElementById('radarStepper');
  const carClassContainer = document.getElementById('radarCarClasses');

  if (stepperContainer && data.mileageRadar.checkpoints) {
    stepperContainer.innerHTML = data.mileageRadar.checkpoints.map((cp, idx) => `
      <button type="button" class="checkpoint-step-btn ${idx === 0 ? 'active' : ''}" data-index="${idx}">
        <div class="flex items-center justify-between">
          <span class="block text-sm font-bold text-white">${cp.mileage}</span>
          <span class="w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-accent' : 'bg-transparent'} step-dot"></span>
        </div>
        <span class="text-[11px] text-textDim block mt-0.5">${cp.label}</span>
      </button>
    `).join('');
  }

  if (carClassContainer && data.mileageRadar.carClasses) {
    carClassContainer.innerHTML = data.mileageRadar.carClasses.map((cc, idx) => `
      <button type="button" class="car-class-pill ${idx === 0 ? 'active' : ''}" data-index="${idx}">
        ${cc.name}
      </button>
    `).join('');
  }
}

function renderReviews(data) {
  const container = document.getElementById('reviewsGrid');
  if (!container || !data.reviews) return;

  container.innerHTML = data.reviews.map((r, idx) => `
    <div class="reveal-init delay-${idx + 1} bg-bgContainer border border-border p-6 rounded flex flex-col justify-between group hover:border-white/30 transition-all duration-300">
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="font-bold text-white text-sm">${r.author}</span>
          <span class="font-mono text-[10px] text-accent font-bold uppercase bg-accent/5 px-2 py-0.5 border border-accent/20 rounded-sm">Проверено</span>
        </div>
        <div class="flex text-amber-400 text-xs star-shimmer">
          ${'★'.repeat(r.rating)}
        </div>
        <p class="text-xs text-textMuted leading-relaxed">
          «${r.text}»
        </p>
      </div>
      <div class="pt-4 mt-4 border-t border-border/60 flex justify-between items-center text-[11px] font-mono text-textDim">
        <span>${r.source}</span>
        <span>${r.date}</span>
      </div>
    </div>
  `).join('');
}

function renderSpareParts(data) {
  const p = data.spareParts;
  if (!p) return;

  const descEl = document.getElementById('sparePartsDesc');
  const advEl = document.getElementById('sparePartsAdvantages');

  if (descEl) descEl.textContent = p.desc;
  if (advEl && p.advantages) {
    advEl.innerHTML = p.advantages.map(a => `
      <li class="flex items-start gap-2.5 text-xs text-textMuted font-mono">
        <span class="material-symbols-outlined text-accent text-sm mt-0.5" style="font-variation-settings: 'FILL' 1;">check_circle</span>
        <span>${a}</span>
      </li>
    `).join('');
  }
}

function initKitchenClock(data) {
  const clockEl = document.getElementById('liveClock');
  const statusEl = document.getElementById('serviceStatusIndicator');

  function update() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    if (clockEl) clockEl.textContent = `${h}:${m}:${s}`;

    // Operating hours check: 08:00 - 18:00
    const curHour = now.getHours();
    const isOpen = curHour >= 8 && curHour < 18;

    if (statusEl) {
      if (isOpen) {
        statusEl.innerHTML = `
          <span class="live-pulse-dot"></span>
          <span class="text-statusOk font-bold">СЕЙЧАС ОТКРЫТО</span>
          <div class="telemetry-equalizer" title="Телеметрия постов активна">
            <span class="telemetry-bar"></span>
            <span class="telemetry-bar"></span>
            <span class="telemetry-bar"></span>
            <span class="telemetry-bar"></span>
          </div>
          <span class="text-textDim">Пн-Сб 08:00–18:00</span>
        `;
      } else {
        statusEl.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
          <span class="text-amber-400 font-bold">ЗАКРЫТО ДО 08:00</span>
          <span class="text-textDim">Прием заявок онлайн</span>
        `;
      }
    }
  }

  update();
  setInterval(update, 1000);
}

function initMobileNav() {
  const btn = document.getElementById('mobileMenuBtn');
  const nav = document.getElementById('mobileNav');
  if (btn && nav) {
    btn.addEventListener('click', () => nav.classList.toggle('hidden'));
    nav.querySelectorAll('a').forEach(l => l.addEventListener('click', () => nav.classList.add('hidden')));
  }
}

function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal-init');
  if (!elements.length) return;

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

function initMetricCounters() {
  const counters = document.querySelectorAll('.metric-counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const raw = el.getAttribute('data-value') || el.textContent;
        const numMatch = raw.match(/([\d\s]+(?:\.\d+)?)/);
        if (numMatch) {
          const numStr = numMatch[1].replace(/\s/g, '');
          const targetNum = parseFloat(numStr);
          const isDecimal = numStr.includes('.');
          const prefix = raw.slice(0, numMatch.index);
          const suffix = raw.slice(numMatch.index + numMatch[1].length);

          const duration = 1200;
          const start = performance.now();

          const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = targetNum * ease;
            const formatted = isDecimal ? current.toFixed(1) : Math.round(current).toLocaleString('ru-RU');
            el.textContent = `${prefix}${formatted}${suffix}`;

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              el.textContent = raw;
            }
          };
          requestAnimationFrame(step);
        }
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.2 });

  counters.forEach(c => observer.observe(c));
}

function initSpotlightCards() {
  document.querySelectorAll('.spotlight-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

function init3DTilt() {
  const container = document.querySelector('.tilt-perspective-container');
  const inner = document.querySelector('.tilt-inner');
  if (!container || !inner) return;

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    inner.style.setProperty('--tilt-x', `${-y * 10}deg`);
    inner.style.setProperty('--tilt-y', `${x * 10}deg`);
  });

  container.addEventListener('mouseleave', () => {
    inner.style.setProperty('--tilt-x', '0deg');
    inner.style.setProperty('--tilt-y', '0deg');
  });
}

function initRippleEffect() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-precision-white, .btn-precision-ghost, .checkpoint-step-btn');
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const circle = document.createElement('span');
    const d = Math.max(rect.width, rect.height);
    circle.style.width = circle.style.height = `${d}px`;
    circle.style.left = `${e.clientX - rect.left - d / 2}px`;
    circle.style.top = `${e.clientY - rect.top - d / 2}px`;
    circle.classList.add('ripple-circle');

    const prev = btn.querySelector('.ripple-circle');
    if (prev) prev.remove();

    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  });
}
