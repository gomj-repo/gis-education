import 'ol/ol.css';
import { createMap } from './map';
import { createAdminLayer } from './layers/wmtsPolygon';
import { createLinesLayer } from './layers/wfsLine';
import { createStationsLayer } from './layers/wmsPoint';
import { createPopup } from './popup';

// VWorld 배경지도 위에 MapPrime OGC 레이어를 올리는 실습 뷰어의 진입점.
const map = createMap('map');

// 레이어 모듈 (이후 커밋에서 WMS/WMTS 추가)
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

// 레이어 표시/숨김 토글
document.querySelectorAll('[data-layer]').forEach((cb) => {
  cb.addEventListener('change', () => {
    const mod = modules[cb.dataset.layer];
    if (mod) mod.layer.setVisible(cb.checked);
  });
});

export default map;
