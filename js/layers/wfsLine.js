import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Stroke } from 'ol/style';

import { wfsUrl, qualified, LAYERS, VIEW_PROJECTION } from '../config';

/** 기본: 피처의 colour 속성으로 노선을 칠한다. (WFS는 데이터를 받아 클라이언트가 그린다) */
function colourStyle(feature) {
  const colour = feature.get('colour') || '#3399cc';
  return new Style({ stroke: new Stroke({ color: colour, width: 3 }) });
}

/** 스타일 토글 ON: blue_polyline.sld 와 동일한 파란 선 */
const blueStyle = new Style({ stroke: new Stroke({ color: '#0000ff', width: 1 }) });

/**
 * 지하철 노선 레이어 (WFS, linestring).
 * WFS를 쓰는 이유: 좌표·속성 원본 데이터를 받아 클라이언트가 직접 그리고 조회하기 위함.
 */
export function createLinesLayer() {
  const url =
    `${wfsUrl()}?service=WFS&version=2.0.0&request=GetFeature` +
    `&typeName=${encodeURIComponent(qualified(LAYERS.lines))}` +
    `&outputFormat=application/json&srsName=${VIEW_PROJECTION}`;

  // 30건 → 한 번에 전부 로드(기본 strategy). GeoJSON은 lon/lat(x,y)로 오므로 4326 뷰와 일치.
  const source = new VectorSource({ format: new GeoJSON(), url });
  const layer = new VectorLayer({ source, style: colourStyle });

  return {
    layer,
    setStyled(on) {
      layer.setStyle(on ? blueStyle : colourStyle);
    },
    /** WFS는 로드된 벡터 피처에서 속성을 바로 읽는다. */
    infoAt(map, evt) {
      let hit = null;
      map.forEachFeatureAtPixel(
        evt.pixel,
        (feature, lyr) => {
          if (lyr === layer) {
            hit = feature;
            return true;
          }
          return false;
        },
        { hitTolerance: 4 },
      );
      if (!hit) return Promise.resolve(null);
      const props = { ...hit.getProperties() };
      delete props.geometry;
      return Promise.resolve({ title: `노선 · ${hit.get('name') || ''}`, props });
    },
  };
}
