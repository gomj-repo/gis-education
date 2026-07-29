import 'ol/ol.css';
import { createMap } from './map';
import { createBaseMaps } from './baseMaps';
import { createAdminLayer } from './layers/wmtsPolygon';
import { createLinesLayer } from './layers/wfsLine';
import { createStationsLayer } from './layers/wmsPoint';
import { createPopup } from './ui/popup';
import { createSidePanel } from './sidePanel';

// VWorld 배경지도 위에 MapPrime OGC 레이어를 올리는 실습 뷰어의 진입점.
const map = createMap('map');

// 배경지도(VWorld) — 데이터 레이어보다 아래(맨 밑)에 깐다.
const baseMaps = createBaseMaps();
baseMaps.orderedLayers.forEach((layer) => map.addLayer(layer));

// 레이어 모듈 (MapPrime OGC: 읍면동 WMTS · 노선 WFS · 역 WMS)
const modules = {
  admin: createAdminLayer(),
  lines: createLinesLayer(),
  stations: createStationsLayer(),
};
// 그리기 순서: 읍면동(면, 아래) → 노선(선) → 역(점, 위)
map.addLayer(modules.admin.layer);
map.addLayer(modules.lines.layer);
map.addLayer(modules.stations.layer);

// 클릭 속성조회 팝업
const popup = createPopup(map);

map.on('singleclick', async (evt) => {
  const results = (
    await Promise.all(Object.values(modules).map((m) => m.infoAt(map, evt)))
  ).filter(Boolean);
  if (results.length) popup.show(evt.coordinate, results);
  else popup.hide();
});

// 피처 위에서 커서를 손가락 모양으로
map.on('pointermove', (evt) => {
  if (evt.dragging) return;
  map.getTargetElement().style.cursor = map.hasFeatureAtPixel(evt.pixel) ? 'pointer' : '';
});

// 좌측 SidePanel(탭): 건물속성 조회 + 레이어 on/off
createSidePanel({ modules });

// 스타일 변경 토글: OFF=기본(스타일 미요청), ON=빨강(면)/파랑(선)/초록(점)
document.getElementById('style-toggle').addEventListener('change', (e) => {
  const on = e.target.checked;
  Object.values(modules).forEach((m) => m.setStyled(on));
});

// 배경지도: 종류 옵션 채우기 + on/off·전환·하이브리드 토글
const baseSelect = document.getElementById('base-select');
Object.entries(baseMaps.TYPES).forEach(([type, { label }]) => {
  const opt = document.createElement('option');
  opt.value = type;
  opt.textContent = label;
  baseSelect.appendChild(opt);
});
baseSelect.addEventListener('change', (e) => baseMaps.setActive(e.target.value));
document
  .getElementById('base-toggle')
  .addEventListener('change', (e) => baseMaps.setVisible(e.target.checked));
document
  .getElementById('hybrid-toggle')
  .addEventListener('change', (e) => baseMaps.setHybrid(e.target.checked));

export default map;
