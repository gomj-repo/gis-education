import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import WMTS from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import { get as getProjection } from 'ol/proj';

import {
  VWORLD_KEY,
  VIEW_PROJECTION,
  WGS84_ORIGIN,
  WGS84_RESOLUTIONS,
} from './config';

/**
 * VWorld 배경지도(WMTS, EPSG:4326).
 * REST 요청 형식: /req/wmts/1.0.0/{KEY}/{Layer}/{TileMatrix}/{TileRow}/{TileCol}.png
 * 왜 WMTS인가: 미리 잘라 둔 타일이라 넓은 배경을 빠르게 깐다.
 */
function createVWorldBase() {
  // 4326 격자의 각 레벨 식별자 — VWorld는 레벨 번호를 그대로 쓴다.
  const matrixIds = WGS84_RESOLUTIONS.map((_, z) => String(z));

  const source = new WMTS({
    url: `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_KEY}/Base/{TileMatrix}/{TileRow}/{TileCol}.png`,
    layer: 'Base',
    matrixSet: 'EPSG:4326',
    format: 'image/png',
    style: 'default',
    projection: getProjection(VIEW_PROJECTION),
    requestEncoding: 'REST',
    tileGrid: new WMTSTileGrid({
      origin: WGS84_ORIGIN,
      resolutions: WGS84_RESOLUTIONS,
      matrixIds,
    }),
    attributions: 'VWorld',
    crossOrigin: 'anonymous',
  });

  return new TileLayer({ source });
}

/**
 * 지도를 생성한다. View는 데이터와 같은 EPSG:4326을 쓰므로
 * MapPrime 레이어(4326)와 재투영 없이 정확히 겹친다.
 * @param {string|HTMLElement} target 지도를 붙일 DOM
 * @returns {Map}
 */
export function createMap(target) {
  return new Map({
    target,
    layers: [createVWorldBase()],
    view: new View({
      projection: getProjection(VIEW_PROJECTION),
      center: [126.98, 37.55], // 서울 중심 (경도, 위도)
      zoom: 11,
      resolutions: WGS84_RESOLUTIONS, // 배경 타일 격자와 줌 레벨을 일치시킨다.
    }),
  });
}
