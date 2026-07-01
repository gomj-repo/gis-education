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
  STYLES,
  VIEW_PROJECTION,
  WGS84_ORIGIN,
  WGS84_RESOLUTIONS,
} from '../config';

// GeoServer GWC의 EPSG:4326 격자 식별자 형식: `EPSG:4326:{level}`
const matrixIds = WGS84_RESOLUTIONS.map((_, z) => `EPSG:4326:${z}`);

/** 스타일별 WMTS 소스를 만든다. (타일은 스타일 단위로 캐시되므로 변경 시 소스를 교체) */
function buildSource(style) {
  return new WMTS({
    url: wmtsUrl(),
    layer: qualified(LAYERS.admin),
    matrixSet: 'EPSG:4326',
    format: 'image/png',
    style: style || '',
    projection: getProjection(VIEW_PROJECTION),
    requestEncoding: 'KVP',
    tileGrid: new WMTSTileGrid({
      origin: WGS84_ORIGIN,
      resolutions: WGS84_RESOLUTIONS,
      matrixIds,
    }),
    crossOrigin: 'anonymous',
  });
}

/**
 * 읍면동 경계 레이어 (WMTS, polygon).
 * WMTS를 쓰는 이유: 미리 잘라 둔 타일이라 넓은 면 데이터를 빠르게 표출한다.
 * 기본은 서버 기본 스타일, 토글 시 red_polygon 타일을 요청한다.
 */
export function createAdminLayer() {
  const layer = new TileLayer({ source: buildSource('') });

  // WMTS는 OL에 GetFeatureInfo 헬퍼가 없어, 같은 레이어의 WMS로 속성만 되묻는다.
  const infoSource = new ImageWMS({
    url: wmsUrl(),
    params: { LAYERS: qualified(LAYERS.admin) },
    projection: VIEW_PROJECTION,
  });

  return {
    layer,
    setStyled(on) {
      layer.setSource(buildSource(on ? STYLES.admin : ''));
    },
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
