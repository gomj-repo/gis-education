import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';

/**
 * 빈 지도를 생성한다. 뷰는 EPSG:3857(웹 메르카토르)이며 서울역을 중심으로 시작한다.
 * 배경(VWorld)·데이터 레이어는 app.js에서 추가한다.
 * @param {string|HTMLElement} target 지도를 붙일 DOM
 * @returns {Map}
 */
export function createMap(target) {
  return new Map({
    target,
    view: new View({
      center: fromLonLat([126.9707, 37.5547]), // 서울역 (경도, 위도) → 3857
      zoom: 14,
    }),
  });
}
