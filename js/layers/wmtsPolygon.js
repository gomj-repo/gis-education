import TileLayer from 'ol/layer/Tile';
import WMTS from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import ImageWMS from 'ol/source/ImageWMS';
import { get as getProjection } from 'ol/proj';

import {
  wmtsUrl,
  wmsUrl,
  qualified,
  LAYERS,
  VIEW_PROJECTION,
  DATA_PROJECTION,
  WMTS_MATRIX_SET,
  WMTS_FORMAT,
} from '../config';

const OPACITY = 0.6; // jpeg 타일은 투명도가 없어 배경을 가리므로 반투명 처리

// GoogleCRS84Quad(EPSG:4326) 격자: origin [-180,90], level0 = 1타일(해상도 1.40625°/px).
// admin WMTS는 이 격자만 지원하므로 소스는 4326로 만들고 OL이 뷰(3857)로 재투영한다.
const data4326 = getProjection(DATA_PROJECTION);
const resolutions = Array.from({ length: 20 }, (_, z) => 1.40625 / 2 ** z);
const matrixIds = resolutions.map((_, z) => `${WMTS_MATRIX_SET}_${z}`);

function buildWmtsSource() {
  return new WMTS({
    url: wmtsUrl(),
    layer: qualified(LAYERS.admin),
    matrixSet: WMTS_MATRIX_SET,
    format: WMTS_FORMAT,
    style: '',
    projection: data4326,
    requestEncoding: 'KVP',
    tileGrid: new WMTSTileGrid({ origin: [-180, 90], resolutions, matrixIds }),
    crossOrigin: 'anonymous',
  });
}

/**
 * 읍면동 경계 레이어 (WMTS, polygon).
 * WMTS를 쓰는 이유: 미리 잘라 둔 타일이라 넓은 면 데이터를 빠르게 표출한다.
 * 스타일 변경은 지원하지 않는다 — WMTS 타일은 스타일별로 캐시되어 기본 스타일만 시드돼
 * 있으므로 STYLE 파라미터가 무시된다. (스타일 토글의 대상이 아님)
 */
export function createAdminLayer() {
  const layer = new TileLayer({ source: buildWmtsSource(), opacity: OPACITY });

  // WMTS는 OL에 GetFeatureInfo 헬퍼가 없어, 같은 레이어의 WMS로 속성만 되묻는다.
  const infoSource = new ImageWMS({
    url: wmsUrl(),
    params: { LAYERS: qualified(LAYERS.admin) },
    projection: VIEW_PROJECTION,
  });

  return {
    layer,
    // WMTS는 스타일 변경 불가(캐시) → 스타일 토글에 반응하지 않는다.
    setStyled() {},
    infoAt(map, evt) {
      const url = infoSource.getFeatureInfoUrl(
        evt.coordinate,
        map.getView().getResolution(),
        VIEW_PROJECTION,
        { INFO_FORMAT: 'application/json', FEATURE_COUNT: 5 },
      );
      if (!url) return Promise.resolve(null);
      return fetch(url)
        .then((r) => (r.ok ? r.json() : null))
        .then((json) => {
          const feature = json && json.features && json.features[0];
          if (!feature) return null;
          const props = { ...feature.properties };
          return { title: `읍면동 · ${props.NAME || ''}`, props };
        })
        .catch(() => null);
    },
  };
}
