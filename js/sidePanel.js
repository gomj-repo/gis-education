import { LAYER_META, wfsFeaturesUrl } from './config';

const esc = (v) =>
  String(v ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

/**
 * 좌측 SidePanel (탭 UI).
 * - 탭 '건물속성 조회': 활성 레이어 select → 선택 레이어의 카드 리스트(WFS 속성 조회)
 * - 탭 '레이어 정보 조회': 레이어 on/off 버튼(active 강조)
 * @param {{ modules: Record<string, {layer: import('ol/layer/Layer').default}> }} opts
 */
export function createSidePanel({ modules }) {
  const keys = Object.keys(LAYER_META);
  const active = Object.fromEntries(keys.map((k) => [k, true]));

  const tabs = [...document.querySelectorAll('#sidepanel .tab')];
  const bodies = {
    attr: document.getElementById('tab-attr'),
    layer: document.getElementById('tab-layer'),
  };
  const select = document.getElementById('attr-layer-select');
  const cards = document.getElementById('attr-cards');
  const layerList = document.getElementById('layer-list');

  // --- 탭 전환 ---
  const activateTab = (name) => {
    tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
    Object.entries(bodies).forEach(([k, el]) => el.classList.toggle('active', k === name));
  };
  tabs.forEach((t) => t.addEventListener('click', () => activateTab(t.dataset.tab)));

  // --- 탭2: 레이어 on/off ---
  const chip = (k) => `<span class="chip chip-${LAYER_META[k].geomType}">${LAYER_META[k].geomType}</span>`;

  const renderLayerList = () => {
    layerList.innerHTML = keys
      .map(
        (k) =>
          `<button class="layer-btn${active[k] ? ' active' : ''}" data-key="${k}">` +
          `${chip(k)}<span class="layer-label">${LAYER_META[k].label}</span>` +
          `<span class="state">${active[k] ? 'ON' : 'OFF'}</span></button>`,
      )
      .join('');
    layerList.querySelectorAll('.layer-btn').forEach((btn) =>
      btn.addEventListener('click', () => toggleLayer(btn.dataset.key)),
    );
  };

  const toggleLayer = (key) => {
    active[key] = !active[key];
    modules[key].layer.setVisible(active[key]);
    renderLayerList();
    refreshSelect();
  };

  // --- 탭1: 활성 레이어 select + 카드 리스트 ---
  const refreshSelect = () => {
    const activeKeys = keys.filter((k) => active[k]);
    const prev = select.value;
    select.innerHTML = activeKeys
      .map((k) => `<option value="${k}">${LAYER_META[k].label}</option>`)
      .join('');
    if (!activeKeys.length) {
      cards.innerHTML = '<p class="empty">활성화된 레이어가 없습니다.</p>';
      return;
    }
    select.value = activeKeys.includes(prev) ? prev : activeKeys[0];
    loadCards(select.value);
  };
  select.addEventListener('change', () => loadCards(select.value));

  let reqToken = 0;
  const loadCards = async (key) => {
    if (!key) return;
    const token = ++reqToken;
    cards.innerHTML = '<p class="empty">불러오는 중…</p>';
    try {
      const res = await fetch(wfsFeaturesUrl(key));
      if (!res.ok) throw new Error(res.status);
      const json = await res.json();
      if (token !== reqToken) return; // 더 최신 요청이 있으면 폐기
      const meta = LAYER_META[key];
      const feats = json.features || [];
      if (!feats.length) {
        cards.innerHTML = '<p class="empty">피처가 없습니다.</p>';
        return;
      }
      // MapPrime WFS는 totalFeatures를 안 주므로, 상한(300)에 닿으면 잘렸다고 안내한다.
      const more = feats.length >= 300 ? `<p class="empty">상위 ${feats.length}건만 표시</p>` : '';
      cards.innerHTML =
        more +
        feats
          .map((f) => {
            const p = f.properties || {};
            const name = p[meta.nameProp] ?? '(이름없음)';
            const rows = Object.entries(p)
              .map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`)
              .join('');
            return (
              `<div class="card"><div class="card-head">` +
              `<strong>${esc(name)}</strong>${chip(key)}</div>` +
              `<table>${rows}</table></div>`
            );
          })
          .join('');
    } catch (e) {
      if (token !== reqToken) return;
      cards.innerHTML = '<p class="empty">불러오기 실패 — MapPrime 서버/CORS를 확인하세요.</p>';
    }
  };

  renderLayerList();
  refreshSelect();
  activateTab('attr');
}
