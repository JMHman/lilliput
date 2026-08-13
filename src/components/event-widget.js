// 변경 의도: 메뉴판에서도 공통 이벤트 데이터를 언어별 카드 모달로 안내합니다.
(() => {
  const EVENT_PATH = 'src/data/events/events.json';
  const FALLBACK_LANGUAGE = 'en';
  const labels = {
    ko: { close: '이벤트 닫기', previous: '이전 이벤트', next: '다음 이벤트', page: '번째 이벤트' },
    en: { close: 'Close events', previous: 'Previous event', next: 'Next event', page: 'event' },
    ja: { close: 'イベントを閉じる', previous: '前のイベント', next: '次のイベント', page: '件目' },
    zh: { close: '关闭活动', previous: '上一个活动', next: '下一个活动', page: '项活动' },
  };

  const style = document.createElement('style');
  style.textContent = `
    .menu-event-trigger{position:fixed;top:1rem;right:1rem;z-index:1001;display:flex;align-items:center;gap:.42rem;padding:.72rem .9rem;border:0;border-radius:999px;background:#3c2a1e;color:#fff;box-shadow:0 5px 16px rgba(40,25,17,.24);font-size:.78rem;font-weight:800;letter-spacing:.06em;cursor:pointer}
    .menu-event-dot{width:7px;height:7px;border-radius:50%;background:#ef9a72;box-shadow:0 0 0 4px rgba(239,154,114,.16)}
    .menu-event-count{display:grid;place-items:center;min-width:20px;height:20px;padding:0 5px;border-radius:999px;background:#fff;color:#3c2a1e;font-size:.7rem}
    .menu-event-backdrop[hidden]{display:none}.menu-event-backdrop{position:fixed;inset:0;z-index:2000;display:flex;align-items:center;justify-content:center;padding:1rem;background:rgba(24,15,10,.62);backdrop-filter:blur(8px)}
    .menu-event-modal{width:min(520px,100%);padding:1.15rem;border-radius:26px;background:#f9f5ee;box-shadow:0 28px 80px rgba(0,0,0,.35)}
    .menu-event-header{display:flex;align-items:center;justify-content:space-between;padding:0 .25rem .65rem;font-weight:900;letter-spacing:.08em}.menu-event-header small{font-weight:600;opacity:.55;letter-spacing:0}.menu-event-close{width:36px;height:36px;border:0;border-radius:50%;background:#fff;color:#3c2a1e;font-size:1.55rem;cursor:pointer}
    .menu-event-stage{position:relative}.menu-event-card{position:relative;display:flex;min-height:390px;flex-direction:column;justify-content:center;overflow:hidden;padding:2rem 1.75rem;border-radius:22px;color:#fff;box-shadow:0 18px 36px rgba(50,29,18,.22)}
    .menu-event-card:before{content:'';position:absolute;inset:-35% -45% auto auto;width:260px;height:260px;border:1px solid rgba(255,255,255,.18);border-radius:50%;box-shadow:0 0 0 45px rgba(255,255,255,.045),0 0 0 90px rgba(255,255,255,.035)}
    .menu-event-card[data-type=review_reward]{background:linear-gradient(145deg,#bf5c54,#6e2f32)}.menu-event-card[data-type=set_discount]{background:linear-gradient(145deg,#a5682c,#4a2818)}.menu-event-card[data-type=pass_discount]{background:linear-gradient(145deg,#385c58,#152e31)}
    .menu-event-kicker{position:absolute;top:1.7rem;left:1.75rem;font-size:.68rem;font-weight:900;letter-spacing:.16em;opacity:.72}.menu-event-card h2{position:relative;margin:0 0 1rem;color:#fff;font-size:clamp(1.7rem,7vw,2.5rem);line-height:1.15;letter-spacing:-.04em}.menu-event-description{position:relative;font-weight:650;line-height:1.65}.menu-event-price{position:relative;display:flex;flex-wrap:wrap;align-items:center;gap:.55rem;margin:1.25rem 0 0}.menu-event-price del{opacity:.62;font-size:.82rem}.menu-event-price strong{color:#ffe09d;font-size:1.65rem}.menu-event-note{position:relative;margin:1.25rem 0 0;padding-top:1rem;border-top:1px solid rgba(255,255,255,.22);font-size:.78rem;line-height:1.6;opacity:.82}
    .menu-event-nav{position:absolute;top:50%;display:grid;width:38px;height:38px;place-items:center;transform:translateY(-50%);border:0;border-radius:50%;background:rgba(255,255,255,.92);box-shadow:0 4px 14px rgba(0,0,0,.2);font-size:1.7rem;cursor:pointer}.menu-event-prev{left:-19px}.menu-event-next{right:-19px}.menu-event-dots{height:34px;display:flex;align-items:flex-end;justify-content:center;gap:8px}.menu-event-dots button{width:7px;height:7px;padding:0;border:0;border-radius:50%;background:#c9bcb0;cursor:pointer}.menu-event-dots button.active{width:22px;border-radius:999px;background:#5a3a2c}
    @media(max-width:520px){.lang-buttons{left:.75rem;transform:none;width:calc(100vw - 8.4rem)!important}.menu-event-trigger{right:.75rem}.menu-event-backdrop{align-items:flex-end;padding:0}.menu-event-modal{width:100%;border-radius:24px 24px 0 0;padding:1rem 1rem calc(1.25rem + env(safe-area-inset-bottom))}.menu-event-card{min-height:390px;padding:1.6rem 1.35rem}.menu-event-kicker{top:1.4rem;left:1.35rem}.menu-event-nav{display:none}}
  `;
  document.head.appendChild(style);

  document.body.insertAdjacentHTML('beforeend', `
    <button type="button" class="menu-event-trigger" id="menu-event-trigger" aria-haspopup="dialog" aria-controls="menu-event-modal" aria-expanded="false" hidden>
      <span class="menu-event-dot" aria-hidden="true"></span><span>EVENT</span><span class="menu-event-count" id="menu-event-count">0</span>
    </button>
    <div class="menu-event-backdrop" id="menu-event-modal" role="dialog" aria-modal="true" aria-labelledby="menu-event-title" hidden>
      <div class="menu-event-modal" tabindex="-1">
        <div class="menu-event-header"><strong><span class="menu-event-dot" aria-hidden="true"></span> EVENT <small id="menu-event-status"></small></strong><button type="button" class="menu-event-close" id="menu-event-close">×</button></div>
        <div class="menu-event-stage"><article class="menu-event-card" id="menu-event-card"><span class="menu-event-kicker">LILLIPUT CHEONGDAM</span><h2 id="menu-event-title"></h2><p class="menu-event-description" id="menu-event-description"></p><div class="menu-event-price" id="menu-event-price"></div><p class="menu-event-note" id="menu-event-note"></p></article><button type="button" class="menu-event-nav menu-event-prev" id="menu-event-prev">‹</button><button type="button" class="menu-event-nav menu-event-next" id="menu-event-next">›</button></div>
        <div class="menu-event-dots" id="menu-event-dots"></div>
      </div>
    </div>`);

  let allEvents = [];
  let visibleEvents = [];
  let index = 0;
  let touchStartX = 0;
  const trigger = document.getElementById('menu-event-trigger');
  const modal = document.getElementById('menu-event-modal');
  const modalPanel = modal.querySelector('.menu-event-modal');
  const card = document.getElementById('menu-event-card');
  const title = document.getElementById('menu-event-title');
  const description = document.getElementById('menu-event-description');
  const price = document.getElementById('menu-event-price');
  const note = document.getElementById('menu-event-note');
  const dots = document.getElementById('menu-event-dots');

  const getLanguage = () => {
    const lang = document.documentElement.lang || FALLBACK_LANGUAGE;
    return ['ko', 'en', 'ja', 'zh'].includes(lang) ? lang : FALLBACK_LANGUAGE;
  };
  const formatWon = value => `${Number(value).toLocaleString('ko-KR')}원`;

  function renderCard() {
    if (!visibleEvents.length) return;
    const language = getLanguage();
    const event = visibleEvents[index];
    const translation = event.translations[language] || event.translations[FALLBACK_LANGUAGE] || event.translations.ko;
    card.dataset.type = event.type;
    title.textContent = translation.title || translation.regular?.title || translation.special?.title || '';
    description.textContent = translation.description || translation.regular?.description || '';
    price.innerHTML = '';
    note.textContent = '';

    if (event.type === 'set_discount' && translation.price) {
      const [regular, special] = translation.price.split('→').map(value => value.trim());
      price.innerHTML = `<del>${regular}</del><span>→</span><strong>${special || regular}</strong>`;
      note.textContent = translation.details || '';
    } else if (event.type === 'review_reward') {
      note.textContent = translation.platforms || '';
    } else if (event.type === 'pass_discount') {
      const special = event.pricing.specialPrice;
      if (special) {
        const copy = translation.special;
        description.textContent = copy.description;
        price.innerHTML = `<del>${formatWon(event.pricing.passPrice)}</del><span>→</span><strong>${formatWon(special)}</strong>`;
        note.textContent = `${copy.regularLabel} · 평일 ${formatWon(event.pricing.regularWeekday)} · 주말 ${formatWon(event.pricing.regularWeekend)}`;
      } else {
        price.innerHTML = `<del>평일 ${formatWon(event.pricing.regularWeekday)} · 주말 ${formatWon(event.pricing.regularWeekend)}</del><span>→</span><strong>${formatWon(event.pricing.passPrice)}</strong>`;
        note.textContent = [translation.regular.validity, translation.regular.registration, translation.regular.refundPolicy].filter(Boolean).join(' · ');
      }
    }

    const languageLabels = labels[language] || labels.en;
    document.getElementById('menu-event-status').textContent = `${index + 1} / ${visibleEvents.length}`;
    document.getElementById('menu-event-close').setAttribute('aria-label', languageLabels.close);
    document.getElementById('menu-event-prev').setAttribute('aria-label', languageLabels.previous);
    document.getElementById('menu-event-next').setAttribute('aria-label', languageLabels.next);
    dots.innerHTML = visibleEvents.map((_, dotIndex) => `<button type="button" class="${dotIndex === index ? 'active' : ''}" data-event-index="${dotIndex}" aria-label="${dotIndex + 1}${languageLabels.page}"></button>`).join('');
  }

  function updateLanguage() {
    const language = getLanguage();
    visibleEvents = allEvents.filter(event => event.active && (!event.audience_locales || event.audience_locales.includes(language)) && event.translations[language]);
    index = 0;
    trigger.hidden = !visibleEvents.length;
    document.getElementById('menu-event-count').textContent = visibleEvents.length;
    renderCard();
  }

  function openModal() { renderCard(); modal.hidden = false; trigger.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; modalPanel.focus(); }
  function closeModal() { modal.hidden = true; trigger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; trigger.focus(); }
  function move(step) { index = (index + step + visibleEvents.length) % visibleEvents.length; renderCard(); }

  trigger.addEventListener('click', openModal);
  document.getElementById('menu-event-close').addEventListener('click', closeModal);
  document.getElementById('menu-event-prev').addEventListener('click', () => move(-1));
  document.getElementById('menu-event-next').addEventListener('click', () => move(1));
  dots.addEventListener('click', event => { const button = event.target.closest('[data-event-index]'); if (button) { index = Number(button.dataset.eventIndex); renderCard(); } });
  modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', event => { if (!modal.hidden && event.key === 'Escape') closeModal(); });
  card.addEventListener('touchstart', event => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  card.addEventListener('touchend', event => { const distance = event.changedTouches[0].clientX - touchStartX; if (Math.abs(distance) > 45) move(distance < 0 ? 1 : -1); }, { passive: true });
  new MutationObserver(updateLanguage).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  fetch(EVENT_PATH).then(response => {
    if (!response.ok) throw new Error('Failed to load events');
    return response.json();
  }).then(data => { allEvents = Array.isArray(data.events) ? data.events : []; updateLanguage(); }).catch(error => console.warn('이벤트 정보를 불러오지 못했습니다.', error));
})();
