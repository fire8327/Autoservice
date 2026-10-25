// ==========================================================================
// МТ АВТОКОМПЛЕКС — ИНТЕРАКТИВНЫЙ РАДАР ТО ПО ПРОБЕГУ
// State Machine & Maintenance Calculation Engine
// ==========================================================================

class MileageRadarEngine {
  constructor(data) {
    this.radarData = data.mileageRadar;
    this.brandData = data.brand;
    this.contacts = data.contacts;

    this.activeCheckpointIndex = 0; // default 15 000 km
    this.activeCarClassIndex = 0;   // default Lada/Domestic

    this.initDOMElements();
    this.attachEventListeners();
    this.render();
  }

  initDOMElements() {
    this.stepperContainer = document.getElementById('radarStepper');
    this.carClassContainer = document.getElementById('radarCarClasses');
    this.radarBadge = document.getElementById('radarBadge');
    this.radarHours = document.getElementById('radarHours');
    this.radarPrice = document.getElementById('radarPrice');
    this.radarChecklist = document.getElementById('radarChecklist');
    this.radarWhatsappBtn = document.getElementById('radarWhatsappBtn');
    this.radarTelegramBtn = document.getElementById('radarTelegramBtn');
    this.radarSummaryText = document.getElementById('radarSummaryText');
  }

  attachEventListeners() {
    // Stepper buttons
    if (this.stepperContainer) {
      this.stepperContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.checkpoint-step-btn');
        if (btn) {
          const idx = parseInt(btn.getAttribute('data-index'), 10);
          if (!isNaN(idx) && idx !== this.activeCheckpointIndex) {
            this.activeCheckpointIndex = idx;
            this.render();
          }
        }
      });
    }

    // Car class selector
    if (this.carClassContainer) {
      this.carClassContainer.addEventListener('click', (e) => {
        const pill = e.target.closest('.car-class-pill');
        if (pill) {
          const idx = parseInt(pill.getAttribute('data-index'), 10);
          if (!isNaN(idx) && idx !== this.activeCarClassIndex) {
            this.activeCarClassIndex = idx;
            this.render();
          }
        }
      });
    }
  }

  render() {
    const cp = this.radarData.checkpoints[this.activeCheckpointIndex];
    const cc = this.radarData.carClasses[this.activeCarClassIndex];
    if (!cp || !cc) return;

    // 1. Update stepper active state
    if (this.stepperContainer) {
      const progressFill = document.getElementById('stepperProgressFill');
      if (progressFill && this.radarData.checkpoints) {
        const pct = ((this.activeCheckpointIndex + 1) / this.radarData.checkpoints.length) * 100;
        progressFill.style.width = `${pct}%`;
      }

      const stepBtns = this.stepperContainer.querySelectorAll('.checkpoint-step-btn');
      stepBtns.forEach((b, i) => {
        const dot = b.querySelector('.step-dot');
        if (i === this.activeCheckpointIndex) {
          b.classList.add('active');
          if (dot) {
            dot.classList.remove('bg-transparent');
            dot.classList.add('bg-accent');
          }
        } else {
          b.classList.remove('active');
          if (dot) {
            dot.classList.remove('bg-accent');
            dot.classList.add('bg-transparent');
          }
        }
      });
    }

    // 2. Update car class active state
    if (this.carClassContainer) {
      const pills = this.carClassContainer.querySelectorAll('.car-class-pill');
      pills.forEach((p, i) => {
        if (i === this.activeCarClassIndex) {
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });
    }

    // 3. Calculate price and duration
    const finalPrice = Math.round(cp.basePrice * cc.multiplier);

    if (this.radarBadge) this.radarBadge.textContent = `${cp.label} • ${cp.mileage}`;
    if (this.radarHours) this.radarHours.textContent = cp.estimatedHours;
    this.animatePrice(finalPrice);

    if (this.radarSummaryText) {
      this.radarSummaryText.textContent = `Класс: ${cc.name} • Регламент ${cp.mileage} • Срок: ~${cp.estimatedHours}`;
    }

    // 4. Render checklist operations with staggered luxury animation
    if (this.radarChecklist) {
      this.radarChecklist.innerHTML = cp.operations.map((op, idx) => `
        <div class="radar-op-row flex items-start gap-3 p-3 bg-bgContainerLow border border-border rounded text-xs font-mono group hover:border-accent/40 transition-all duration-200" style="animation-delay: ${idx * 0.04}s">
          <span class="material-symbols-outlined text-sm ${op.required ? 'text-accent' : 'text-textDim'} mt-0.5" style="font-variation-settings: 'FILL' 1;">
            ${op.required ? 'check_circle' : 'add_circle'}
          </span>
          <div class="flex-1">
            <span class="text-white block font-medium group-hover:text-neutral-100 transition-colors">${op.name}</span>
            <span class="text-[10px] text-textDim uppercase tracking-wider">${op.required ? 'Обязательный регламент' : 'Рекомендованная процедура'}</span>
          </div>
        </div>
      `).join('');
    }

    // 5. Update WhatsApp and Telegram direct links
    const phoneRaw = this.contacts.phonePrimaryRaw.replace(/[^0-9]/g, '');
    let msg = `Здравствуйте! Хочу записаться на ТО в МТ Автокомплекс (Канаш, Кооперативная, 43):\n\n`;
    msg += `🚗 Класс авто: ${cc.name}\n`;
    msg += `📍 Регламент пробега: ${cp.mileage} (${cp.label})\n`;
    msg += `⏱ Расчетное время: ${cp.estimatedHours}\n`;
    msg += `💰 Фиксированная стоимость: ${finalPrice.toLocaleString('ru-RU')} ₽\n\n`;
    msg += `Подскажите, на какое время сегодня/завтра есть свободный подъемник?`;

    const encodedMsg = encodeURIComponent(msg);

    if (this.radarWhatsappBtn) {
      this.radarWhatsappBtn.href = `https://wa.me/${phoneRaw}?text=${encodedMsg}`;
    }
    if (this.radarTelegramBtn) {
      this.radarTelegramBtn.href = this.contacts.telegramDirect || this.contacts.telegram;
    }
  }

  animatePrice(targetPrice) {
    if (!this.radarPrice) return;
    const startPrice = this.currentPrice || targetPrice;
    this.currentPrice = targetPrice;

    if (startPrice === targetPrice) {
      this.radarPrice.textContent = `${targetPrice.toLocaleString('ru-RU')} ₽`;
      return;
    }

    const duration = 280;
    const startTime = performance.now();

    const updateFrame = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const val = Math.round(startPrice + (targetPrice - startPrice) * ease);
      this.radarPrice.textContent = `${val.toLocaleString('ru-RU')} ₽`;

      if (progress < 1) {
        requestAnimationFrame(updateFrame);
      }
    };

    requestAnimationFrame(updateFrame);
    this.radarPrice.style.transform = 'scale(1.05)';
    setTimeout(() => { if (this.radarPrice) this.radarPrice.style.transform = 'scale(1)'; }, 180);
  }
}

window.MileageRadarEngine = MileageRadarEngine;
